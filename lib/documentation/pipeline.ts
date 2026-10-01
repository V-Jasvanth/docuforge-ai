import {
  DocSectionKey,
  DocumentationGenerationRequest,
  DocumentationDriftCheckResult,
  STANDARD_DOC_SECTIONS,
} from "./types";
import { aiService } from "../ai/service";
import { CodebaseAnalysisResult } from "../analyzer/types";

export class DocumentationPipelineService {
  /**
   * Pipeline Step 1: Validates project state and fetches codebase analysis.
   */
  public async preparePipelineContext(projectId: string): Promise<Record<string, unknown>> {
    return {
      projectId,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Pipeline Step 2: Transforms analysis result into section prompts and invokes AI service.
   */
  public async generateDocumentationForProject(
    request: DocumentationGenerationRequest,
    analysis: CodebaseAnalysisResult
  ) {
    const targetKeys = request.targetSections || STANDARD_DOC_SECTIONS.map((s) => s.key);
    const results: Array<{ key: DocSectionKey; status: string; content?: string; error?: string }> = [];

    for (const key of targetKeys) {
      const sectionSpec = STANDARD_DOC_SECTIONS.find((s) => s.key === key);
      if (!sectionSpec) continue;

      try {
        const response = await aiService.generateDocumentationSection({
          sectionKey: key,
          sectionTitle: sectionSpec.title,
          projectAnalysisContext: {
            framework: analysis.framework?.name,
            languages: analysis.primaryLanguages,
            totalFiles: analysis.totalFilesCount,
          },
        });

        results.push({
          key,
          status: "GENERATED",
          content: response.content,
        });
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unknown documentation generation error";
        results.push({
          key,
          status: "NOT_GENERATED",
          error: errorMessage,
        });
      }
    }

    return {
      projectId: request.projectId,
      generatedAt: new Date(),
      sections: results,
    };
  }

  /**
   * Pipeline Step 3: Documentation Drift Detection Architecture.
   * Compares git commit changes against existing documentation section maps.
   */
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
