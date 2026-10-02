import type { CodebaseAnalysisResult } from "../analyzer/types";
import type { DocSectionKey } from "./types";
import { sanitizeObject } from "./sanitizer";

export interface ProjectWorkspaceInfo {
  id: string;
  name: string;
  description?: string | null;
  framework?: string | null;
  languages?: string[];
  docVersion?: string;
  repository?: {
    name: string;
    owner: string;
    url: string;
    branch: string;
  } | null;
}

export interface SectionAiContext {
  projectId: string;
  projectName: string;
  projectDescription: string;
  repository: {
    owner: string;
    name: string;
    url: string;
    branch: string;
  };
  framework?: string;
  primaryLanguages: string[];
  packageManagers: string[];
  dependenciesCount: number;
  keyDependencies: string[];
  apiRoutes: Array<{ path: string; handlerFile: string }>;
  databases: string[];
  databaseModels: Array<{ name: string; fieldsCount: number; sourceFile: string }>;
  documentationFiles: string[];
  detectedFeatures: string[];
  analysisWarnings: string[];
  sectionSpecificData?: Record<string, unknown>;
}

export class DocumentationContextBuilder {
  public buildContext(
    sectionKey: DocSectionKey,
    analysis: CodebaseAnalysisResult,
    project: ProjectWorkspaceInfo,
    additionalFiles: Record<string, string> = {}
  ): SectionAiContext {
    const primaryLanguages = analysis.languages ? analysis.languages.map((l) => `${l.language} (${l.percentage}%)`) : [];
    const keyDependencies = (analysis.dependencies || [])
      .slice(0, 25)
      .map((d) => `${d.name}@${d.version}${d.isDevDependency ? " (dev)" : ""}`);

    const baseContext: SectionAiContext = {
      projectId: project.id,
      projectName: project.name,
      projectDescription: project.description || "Software project codebase.",
      repository: {
        owner: project.repository?.owner || "unknown",
        name: project.repository?.name || "unknown",
        url: project.repository?.url || "https://github.com",
        branch: project.repository?.branch || "main",
      },
      framework: analysis.framework?.name || project.framework || "Detected Stack",
      primaryLanguages,
      packageManagers: analysis.packageManagers || [],
      dependenciesCount: analysis.dependencies ? analysis.dependencies.length : 0,
      keyDependencies,
      apiRoutes: (analysis.apiRoutes || []).map((r) => ({ path: r.path, handlerFile: r.handlerFile })),
      databases: analysis.databases || [],
      databaseModels: (analysis.databaseModels || []).map((m) => ({
        name: m.name,
        fieldsCount: m.fieldsCount,
        sourceFile: m.sourceFile,
      })),
      documentationFiles: analysis.documentationFiles || [],
      detectedFeatures: analysis.detectedFeatures || [],
      analysisWarnings: analysis.analysisWarnings || [],
    };

    const sectionData: Record<string, unknown> = {};

    switch (sectionKey) {
      case "api_reference":
        sectionData.routesDetail = analysis.apiRoutes || [];
        break;
      case "database":
        sectionData.modelsDetail = analysis.databaseModels || [];
        sectionData.databases = analysis.databases || [];
        if (additionalFiles["prisma/schema.prisma"]) {
          sectionData.prismaSchemaSnippet = additionalFiles["prisma/schema.prisma"].slice(0, 3000);
        }
        break;
      case "environment_variables":
        if (additionalFiles[".env.example"]) {
          sectionData.envExampleSnippet = additionalFiles[".env.example"].slice(0, 2000);
        }
        break;
      case "readme":
        if (additionalFiles["README.md"]) {
          sectionData.existingReadmeSnippet = additionalFiles["README.md"].slice(0, 2500);
        }
        break;
      case "architecture":
      case "folder_structure":
        sectionData.fileMetadataSummary = (analysis.fileMetadataList || [])
          .filter((f) => !f.isIgnored)
          .slice(0, 60)
          .map((f) => ({ path: f.path, category: f.category, size: f.sizeBytes }));
        break;
      default:
        break;
    }

    baseContext.sectionSpecificData = sectionData;

    return sanitizeObject(baseContext);
  }
}

export const documentationContextBuilder = new DocumentationContextBuilder();
