export type DocSectionKey =
  | "readme"
  | "overview"
  | "architecture"
  | "installation"
  | "environment_variables"
  | "api_reference"
  | "database"
  | "folder_structure"
  | "configuration"
  | "deployment"
  | "development"
  | "troubleshooting"
  | "contributing";

export interface DocSectionSpec {
  key: DocSectionKey;
  title: string;
  description: string;
  defaultOrder: number;
}

export interface DocumentationGenerationRequest {
  projectId: string;
  targetSections?: DocSectionKey[];
  forceRegenerate?: boolean;
}

export interface DocumentationDriftCheckResult {
  projectId: string;
  isDriftDetected: boolean;
  affectedFiles: string[];
  affectedDocSections: DocSectionKey[];
  checkedAt: Date;
  summary: string;
}

export const STANDARD_DOC_SECTIONS: DocSectionSpec[] = [
  { key: "readme", title: "README", description: "Standard root repository documentation", defaultOrder: 1 },
  { key: "overview", title: "Project Overview", description: "High-level summary of application purpose and feature breakdown", defaultOrder: 2 },
  { key: "architecture", title: "Architecture Guide", description: "System design, component breakdown, and data flow diagrams", defaultOrder: 3 },
  { key: "installation", title: "Installation Guide", description: "Prerequisites, setup steps, and environment initialization", defaultOrder: 4 },
  { key: "environment_variables", title: "Environment Variables", description: "Detailed specification of required & optional ENV parameters", defaultOrder: 5 },
  { key: "api_reference", title: "API Reference", description: "REST/GraphQL route definitions, payload schemas, and responses", defaultOrder: 6 },
  { key: "database", title: "Database Architecture", description: "ER diagrams, table schemas, relationships, and migration guides", defaultOrder: 7 },
  { key: "folder_structure", title: "Folder Structure", description: "Annotated visual breakdown of codebase directory tree", defaultOrder: 8 },
  { key: "configuration", title: "Configuration Guide", description: "Framework configs, build options, and third-party setups", defaultOrder: 9 },
  { key: "deployment", title: "Deployment Guide", description: "Production build, Docker, CI/CD, and hosting instructions", defaultOrder: 10 },
  { key: "development", title: "Development Guide", description: "Workflow instructions for local development, linting, and testing", defaultOrder: 11 },
  { key: "troubleshooting", title: "Troubleshooting & FAQ", description: "Common issues, error codes, and resolution steps", defaultOrder: 12 },
  { key: "contributing", title: "Contribution Guide", description: "Guidelines for code style, pull requests, and commit conventions", defaultOrder: 13 },
];
