import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { gitHubService } from "@/lib/github/service";
import { codebaseAnalyzerService } from "@/lib/analyzer/service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  try {
    // 1. Check Project & Repository existence
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { repository: true },
    });

    if (!project || !project.repository) {
      return NextResponse.json(
        { success: false, error: "Project or connected repository not found." },
        { status: 404 }
      );
    }

    const { owner, name: repoName, branch: targetBranch } = project.repository;

    // 2. Mark project as ANALYZING
    await prisma.project.update({
      where: { id: projectId },
      data: { status: "ANALYZING" },
    });

    // 3. Fetch GitHub metadata & file tree
    let repoMetadata;
    try {
      repoMetadata = await gitHubService.getRepositoryMetadata(owner, repoName);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to connect to GitHub API.";
      await prisma.project.update({
        where: { id: projectId },
        data: { status: "ERROR" },
      });
      await prisma.analysis.create({
        data: {
          projectId,
          status: "FAILED",
          errorMessage: msg,
        },
      });
      return NextResponse.json(
        { success: false, error: msg },
        { status: 400 }
      );
    }

    const activeBranch = targetBranch || repoMetadata.defaultBranch || "main";
    let fileNodes;
    try {
      fileNodes = await gitHubService.getFileTree(owner, repoName, activeBranch);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to fetch repository file tree.";
      await prisma.project.update({
        where: { id: projectId },
        data: { status: "ERROR" },
      });
      await prisma.analysis.create({
        data: {
          projectId,
          status: "FAILED",
          errorMessage: msg,
        },
      });
      return NextResponse.json(
        { success: false, error: msg },
        { status: 400 }
      );
    }

    // 4. Identify key manifest files & selectively fetch contents
    const keyManifestPaths = [
      "package.json",
      "requirements.txt",
      "pyproject.toml",
      "Cargo.toml",
      "go.mod",
      "prisma/schema.prisma",
      "README.md",
    ];

    const manifestContents: Record<string, string> = {};

    await Promise.all(
      keyManifestPaths.map(async (path) => {
        const fileMatch = fileNodes.find((f) => f.path.toLowerCase() === path.toLowerCase());
        if (fileMatch) {
          try {
            const content = await gitHubService.getFileContent(owner, repoName, fileMatch.path, activeBranch);
            manifestContents[fileMatch.path] = content;
          } catch {
            // Ignore individual manifest fetch failure
          }
        }
      })
    );

    // 5. Run Codebase Analyzer Engine
    const analysisResult = await codebaseAnalyzerService.analyzeRepositoryTree(
      projectId,
      fileNodes,
      manifestContents
    );

    // 6. Persist Analysis into Prisma PostgreSQL
    const createdAnalysis = await prisma.analysis.create({
      data: {
        projectId,
        status: "COMPLETED",
        filesCount: analysisResult.totalFileCount,
        totalLines: analysisResult.estimatedLinesOfCode,
        detectedFramework: analysisResult.framework?.name || null,
        detectedLanguages: analysisResult.languages.map((l) => `${l.language} (${l.percentage}%)`),
        summary: JSON.parse(JSON.stringify(analysisResult)),
        analysisFiles: {
          create: analysisResult.fileMetadataList.slice(0, 500).map((f) => ({
            path: f.path,
            name: f.name,
            extension: f.extension || null,
            size: f.sizeBytes,
            isIgnored: f.isIgnored,
            category: f.category,
            metadata: {
              ignoreReason: f.ignoreReason || null,
            },
          })),
        },
      },
    });

    // 7. Update Project & Repository Status
    const primaryLangs = analysisResult.languages.map((l) => l.language);

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        status: "READY",
        framework: analysisResult.framework?.name || project.framework || "Unknown",
        languages: primaryLangs,
        lastAnalyzedAt: new Date(),
        repository: {
          update: {
            branch: activeBranch,
            lastSyncedAt: new Date(),
          },
        },
        activities: {
          create: {
            userId: project.userId,
            type: "ANALYSIS_COMPLETED",
            title: "Repository Analysis Completed",
            description: `Analyzed ${analysisResult.totalFileCount} files in ${owner}/${repoName}. Detected ${
              analysisResult.framework?.name || "codebase"
            }.`,
          },
        },
      },
      include: {
        repository: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Repository analysis completed successfully.",
      data: {
        analysis: createdAnalysis,
        project: updatedProject,
        summary: analysisResult,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error performing repository analysis.";
    await prisma.project.update({
      where: { id: projectId },
      data: { status: "ERROR" },
    }).catch(() => {});

    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
