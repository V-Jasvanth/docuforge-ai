export type FileCategory =
  | "CONFIG"
  | "SOURCE_CODE"
  | "API_ROUTE"
  | "DATABASE_SCHEMA"
  | "DOCUMENTATION"
  | "TEST"
  | "ASSET"
  | "UNKNOWN";

export interface AnalyzedFileMetadata {
  path: string;
  name: string;
  extension: string;
  sizeBytes: number;
  category: FileCategory;
  isIgnored: boolean;
  ignoreReason?: string;
  linesOfCode?: number;
}

export interface DetectedFramework {
  name: string;
  version?: string;
  confidence: number;
  indicatorsFound: string[];
}

export interface DetectedDependency {
  name: string;
  version: string;
  isDevDependency: boolean;
}

export interface DetectedApiRoute {
  path: string;
  method?: string;
  handlerFile: string;
}

export interface DetectedDbModel {
  name: string;
  fieldsCount: number;
  sourceFile: string;
}

export interface CodebaseAnalysisResult {
  projectId: string;
  analyzedAt: Date;
  totalFilesCount: number;
  scannedFilesCount: number;
  ignoredFilesCount: number;
  totalLinesOfCode: number;
  primaryLanguages: Array<{ language: string; percentage: number; fileCount: number }>;
  framework?: DetectedFramework;
  dependencies: DetectedDependency[];
  apiRoutes: DetectedApiRoute[];
  databaseModels: DetectedDbModel[];
  directoryStructureTree: Record<string, unknown>;
  fileMetadataList: AnalyzedFileMetadata[];
  status: "COMPLETED" | "PARTIAL" | "FAILED";
}

export interface AnalyzerConfig {
  maxFileSizeBytes: number; // e.g. 500KB
  ignoredDirectories: string[];
  ignoredExtensions: string[];
}
