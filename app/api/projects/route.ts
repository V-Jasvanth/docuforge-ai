import { NextRequest, NextResponse } from "next/server";
import { createProjectSchema, parseGitHubUrl } from "@/lib/validation";
import { prisma } from "@/lib/db/prisma";

async function getOrCreateDefaultUser() {
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: "Alex Vance",
        email: "demo@docuforge.ai",
        passwordHash: "$2b$10$demo_hash_placeholder",
      },
    });
  }
  return user;
}

export async function GET(req: NextRequest) {
  try {
    const user = await getOrCreateDefaultUser();

    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      include: {
        repository: true,
        analyses: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: projects.map((p) => {
        const latestAnalysis = p.analyses[0];
        return {
          id: p.id,
          name: p.name,
          description: p.description,
          framework: p.framework || latestAnalysis?.detectedFramework || "Unknown",
          languages: p.languages.length > 0 ? p.languages : latestAnalysis?.detectedLanguages || [],
          status: p.status,
          docVersion: p.docVersion,
          lastAnalyzedAt: p.lastAnalyzedAt,
          repository: p.repository
            ? {
                name: p.repository.name,
                owner: p.repository.owner,
                url: p.repository.url,
                branch: p.repository.branch,
              }
            : null,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        };
      }),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch projects";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Zod Validation
    const validationResult = createProjectSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { name, repositoryUrl, branch, framework, description } = validationResult.data;

    // 2. Extract GitHub repository info
    const parsedGitUrl = parseGitHubUrl(repositoryUrl);
    if (!parsedGitUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid GitHub repository URL. Must be a valid github.com repository.",
        },
        { status: 400 }
      );
    }

    const user = await getOrCreateDefaultUser();

    // 3. Duplicate check for same user & repository
    const existingRepo = await prisma.repository.findFirst({
      where: {
        owner: parsedGitUrl.owner,
        name: parsedGitUrl.repo,
        project: {
          userId: user.id,
        },
      },
      include: {
        project: true,
      },
    });

    if (existingRepo && existingRepo.project) {
      return NextResponse.json(
        {
          success: true,
          message: "Repository is already connected to an existing project.",
          data: existingRepo.project,
        },
        { status: 200 }
      );
    }

    // 4. Create Project & Repository records in Prisma
    const project = await prisma.project.create({
      data: {
        userId: user.id,
        name,
        description: description || null,
        framework: framework || null,
        status: "IDLE",
        repository: {
          create: {
            name: parsedGitUrl.repo,
            owner: parsedGitUrl.owner,
            url: parsedGitUrl.url,
            branch: branch || "main",
            provider: "github",
            isConnected: true,
          },
        },
        activities: {
          create: {
            userId: user.id,
            type: "PROJECT_CREATED",
            title: "Project Connected",
            description: `Connected GitHub repository ${parsedGitUrl.owner}/${parsedGitUrl.repo}`,
          },
        },
      },
      include: {
        repository: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Project created successfully",
        data: project,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error creating project";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
