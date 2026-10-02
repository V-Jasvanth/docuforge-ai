export type FileCategory =
  | "CONFIG"
  | "SOURCE"
  | "API"
  | "DATABASE"
  | "DOCUMENTATION"
  | "TEST"
  | "STYLES"
  | "COMPONENT"
  | "UTILITY"
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

export interface LanguageBreakdown {
  language: string;
  fileCount: number;
  percentage: number;
}

export interface ParsedManifestResult {
  manifestPath: string;
  packageManager?: string;
  dependencies: DetectedDependency[];
  frameworkIndicators: string[];
  databaseIndicators: string[];
  runtime?: string;
}

export interface CodebaseAnalysisResult {
  projectId: string;
  analyzedAt: Date;
  totalFileCount: number;
  sourceFileCount: number;
  scannedFilesCount: number;
  ignoredFileCount: number;
  estimatedLinesOfCode: number;
  languages: LanguageBreakdown[];
  framework?: DetectedFramework;
  packageManagers: string[];
  dependencies: DetectedDependency[];
  apiRoutes: DetectedApiRoute[];
  databases: string[];
  databaseModels: DetectedDbModel[];
  documentationFiles: string[];
  detectedFeatures: string[];
  analysisWarnings: string[];
  fileMetadataList: AnalyzedFileMetadata[];
  status: "COMPLETED" | "PARTIAL" | "FAILED";
}

export interface AnalyzerConfig {
  maxFileSizeBytes: number; // e.g. 512KB
  ignoredDirectories: string[];
  ignoredExtensions: string[];
}
