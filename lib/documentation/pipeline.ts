import type {
  DocSectionKey,
  DocumentationGenerationRequest,
  DocumentationDriftCheckResult,
} from "./types";
import { STANDARD_DOC_SECTIONS } from "./types";
import { aiService } from "../ai/service";
import { documentationContextBuilder } from "./context";
import { sanitizeText } from "./sanitizer";
import { prisma } from "../db/prisma";
import type { CodebaseAnalysisResult } from "../analyzer/types";

export class DocumentationPipelineService {
  public validateGeneratedSection(content: string, sectionTitle: string): { isValid: boolean; reason?: string } {
    if (!content || typeof content !== "string" || content.trim().length < 20) {
      return { isValid: false, reason: `Generated output for '${sectionTitle}' was empty or too short.` };
    }

    if (content.includes("[REDACTED_API_KEY]") || content.includes("sk-ant-") || content.includes("ghp_")) {
      return { isValid: false, reason: `Generated output for '${sectionTitle}' contained un-redacted secret tokens.` };
    }

    return { isValid: true };
  }

  public async generateDocumentationForProject(request: DocumentationGenerationRequest) {
    const { projectId, targetSections } = request;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        repository: true,
        analyses: {
          where: { status: "COMPLETED" },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!project) {
      throw new Error(`Project '${projectId}' not found.`);
    }

    const latestAnalysisRecord = project.analyses[0];
    if (!latestAnalysisRecord || !latestAnalysisRecord.summary) {
      throw new Error("Analyze the repository before generating documentation.");
    }

    const analysis = latestAnalysisRecord.summary as unknown as CodebaseAnalysisResult;

    const keysToGenerate: DocSectionKey[] = targetSections || STANDARD_DOC_SECTIONS.map((s) => s.key);

    let docRecord = await prisma.documentation.findFirst({
      where: { projectId },
    });

    if (!docRecord) {
      docRecord = await prisma.documentation.create({
        data: {
          projectId,
          title: `${project.name} Documentation`,
          description: `Technical codebase documentation generated for ${project.name}`,
          isPublished: true,
        },
      });
    }

    const generationResults: Array<{
      key: DocSectionKey;
      title: string;
      status: string;
      content: string;
      error?: string;
    }> = [];

    for (const key of keysToGenerate) {
      const spec = STANDARD_DOC_SECTIONS.find((s) => s.key === key);
      if (!spec) continue;

      try {
        const context = documentationContextBuilder.buildContext(key, analysis, project);

        const response = await aiService.generateDocumentationSection({
          sectionKey: key,
          sectionTitle: spec.title,
          projectAnalysisContext: context as unknown as Record<string, unknown>,
        });

        const rawContent = response.content;
        const sanitizedContent = sanitizeText(rawContent);

        const validation = this.validateGeneratedSection(sanitizedContent, spec.title);
        if (!validation.isValid) {
          throw new Error(validation.reason || "Validation failed");
        }

        await prisma.documentationSection.upsert({
          where: {
            id: (
              await prisma.documentationSection.findFirst({
                where: { documentationId: docRecord.id, key },
              })
            )?.id || "new-section-id",
          },
          create: {
            documentationId: docRecord.id,
            key,
            title: spec.title,
            content: sanitizedContent,
            status: "GENERATED",
            order: spec.defaultOrder,
            lastGeneratedAt: new Date(),
          },
          update: {
            title: spec.title,
            content: sanitizedContent,
            status: "GENERATED",
            order: spec.defaultOrder,
            lastGeneratedAt: new Date(),
          },
        });

        generationResults.push({
          key,
          title: spec.title,
          status: "GENERATED",
          content: sanitizedContent,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Generation failed";
        generationResults.push({
          key,
          title: spec.title,
          status: "NOT_GENERATED",
          content: "",
          error: msg,
        });
      }
    }

    const docVersion = project.docVersion || "1.0.0";
    await prisma.project.update({
      where: { id: projectId },
      data: {
        lastDocGeneratedAt: new Date(),
        activities: {
          create: {
            userId: project.userId,
            type: "DOCS_GENERATED",
            title: "Documentation Generated",
            description: `Generated ${generationResults.filter((r) => r.status === "GENERATED").length} documentation sections.`,
          },
        },
      },
    });

    const allSections = await prisma.documentationSection.findMany({
      where: { documentationId: docRecord.id },
      orderBy: { order: "asc" },
    });

    await prisma.documentationVersion.create({
      data: {
        projectId,
        version: docVersion,
        changelog: `Generated ${allSections.length} documentation sections`,
        createdBy: "DocuForge AI Engine",
        snapshotData: JSON.parse(JSON.stringify(allSections)),
      },
    });

    return {
      projectId,
      documentationId: docRecord.id,
      docVersion,
      generatedAt: new Date(),
      sections: allSections,
      summary: generationResults,
    };
  }

  public async regenerateSingleSection(projectId: string, sectionKey: DocSectionKey) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        repository: true,
        analyses: {
          where: { status: "COMPLETED" },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!project) throw new Error(`Project '${projectId}' not found.`);

    const latestAnalysisRecord = project.analyses[0];
    if (!latestAnalysisRecord || !latestAnalysisRecord.summary) {
      throw new Error("Analyze the repository before regenerating documentation.");
    }

    const analysis = latestAnalysisRecord.summary as unknown as CodebaseAnalysisResult;
    const spec = STANDARD_DOC_SECTIONS.find((s) => s.key === sectionKey);
    if (!spec) throw new Error(`Invalid section key '${sectionKey}'.`);

    let docRecord = await prisma.documentation.findFirst({
      where: { projectId },
    });

    if (!docRecord) {
      docRecord = await prisma.documentation.create({
        data: {
          projectId,
          title: `${project.name} Documentation`,
          isPublished: true,
        },
      });
    }

    const context = documentationContextBuilder.buildContext(sectionKey, analysis, project);

    const response = await aiService.regenerateSection({
      sectionKey,
      sectionTitle: spec.title,
      projectAnalysisContext: context as unknown as Record<string, unknown>,
    });

    const sanitizedContent = sanitizeText(response.content);
    const validation = this.validateGeneratedSection(sanitizedContent, spec.title);
    if (!validation.isValid) {
      throw new Error(validation.reason || "Section regeneration validation failed.");
    }

    const existingSection = await prisma.documentationSection.findFirst({
      where: { documentationId: docRecord.id, key: sectionKey },
    });

    const updatedSection = await prisma.documentationSection.upsert({
      where: { id: existingSection?.id || "new-section-id" },
      create: {
        documentationId: docRecord.id,
        key: sectionKey,
        title: spec.title,
        content: sanitizedContent,
        status: "GENERATED",
        order: spec.defaultOrder,
        lastGeneratedAt: new Date(),
      },
      update: {
        content: sanitizedContent,
        status: "GENERATED",
        lastGeneratedAt: new Date(),
      },
    });

    await prisma.activity.create({
      data: {
        projectId,
        userId: project.userId,
        type: "SECTION_UPDATED",
        title: `Section '${spec.title}' Regenerated`,
        description: `Regenerated section '${spec.title}' using AI provider ${response.providerName}`,
      },
    });

    return updatedSection;
  }

  public async detectDocumentationDrift(
    projectId: string,
    changedFiles: string[]
  ): Promise<DocumentationDriftCheckResult> {
    const affectedSections: DocSectionKey[] = [];

    for (const file of changedFiles) {
      const lower = file.toLowerCase();
      if (lower.includes("/api/") || lower.includes("route.")) {
        if (!affectedSections.includes("api_reference")) affectedSections.push("api_reference");
      }
      if (lower.includes("schema.prisma") || lower.includes("models")) {
        if (!affectedSections.includes("database")) affectedSections.push("database");
      }
      if (lower.includes(".env") || lower.includes("config")) {
        if (!affectedSections.includes("environment_variables")) affectedSections.push("environment_variables");
      }
    }

    return {
      projectId,
      isDriftDetected: affectedSections.length > 0,
      affectedFiles: changedFiles,
      affectedDocSections: affectedSections,
      checkedAt: new Date(),
      summary:
        affectedSections.length > 0
          ? `Detected potential documentation drift in ${affectedSections.length} section(s) based on ${changedFiles.length} file change(s).`
          : "Documentation is up to date with repository state.",
    };
  }
}

export const documentationPipelineService = new DocumentationPipelineService();
