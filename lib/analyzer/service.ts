import {
  CodebaseAnalysisResult,
  AnalyzerConfig,
  AnalyzedFileMetadata,
  FileCategory,
  DetectedFramework,
  DetectedDependency,
  DetectedApiRoute,
  DetectedDbModel,
  LanguageBreakdown,
  ParsedManifestResult,
} from "./types";

export const DEFAULT_ANALYZER_CONFIG: AnalyzerConfig = {
  maxFileSizeBytes: 512 * 1024, // 512 KB
  ignoredDirectories: [
    "node_modules",
    ".git",
    ".next",
    "dist",
    "build",
    "coverage",
    "venv",
    ".venv",
    "__pycache__",
    "target",
    "vendor",
    ".turbo",
    ".idea",
    ".vscode",
  ],
  ignoredExtensions: [
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".webp",
    ".ico",
    ".pdf",
    ".zip",
    ".tar",
    ".gz",
    ".exe",
    ".dll",
    ".so",
    ".woff",
    ".woff2",
    ".ttf",
    ".eot",
    ".lock",
    ".lockb",
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
  ],
};

export class CodebaseAnalyzerService {
  private config: AnalyzerConfig;

  constructor(config: Partial<AnalyzerConfig> = {}) {
    this.config = { ...DEFAULT_ANALYZER_CONFIG, ...config };
  }

  public isIgnoredFile(filePath: string, sizeBytes: number = 0): { isIgnored: boolean; reason?: string } {
    const parts = filePath.split(/[/\\]/);

    for (const dir of this.config.ignoredDirectories) {
      if (parts.includes(dir)) {
        return { isIgnored: true, reason: `Matches ignored directory: ${dir}` };
      }
    }

    const filename = parts[parts.length - 1].toLowerCase();
    if (this.config.ignoredExtensions.includes(filename)) {
      return { isIgnored: true, reason: `Matches ignored lock file: ${filename}` };
    }

    const ext = filePath.includes(".") ? `.${filePath.split(".").pop()?.toLowerCase()}` : "";
    if (this.config.ignoredExtensions.includes(ext)) {
      return { isIgnored: true, reason: `Matches binary or ignored extension: ${ext}` };
    }

    if (sizeBytes > this.config.maxFileSizeBytes) {
      return { isIgnored: true, reason: `Exceeds max file size limit (${this.config.maxFileSizeBytes} bytes)` };
    }

    return { isIgnored: false };
  }

  public categorizeFile(filePath: string): FileCategory {
    const lower = filePath.toLowerCase();
    const filename = lower.split(/[/\\]/).pop() || "";

    // CONFIG Manifests
    if (
      filename === "package.json" ||
      filename === "tsconfig.json" ||
      filename === "next.config.js" ||
      filename === "next.config.mjs" ||
      filename === "next.config.ts" ||
      filename === "vite.config.ts" ||
      filename === "requirements.txt" ||
      filename === "pyproject.toml" ||
      filename === "cargo.toml" ||
      filename === "go.mod" ||
      filename === "pom.xml" ||
      filename === "build.gradle" ||
      filename.includes(".env") ||
      filename.includes("tailwind") ||
      filename.includes("eslint")
    ) {
      return "CONFIG";
    }

    // DATABASE
    if (
      filename === "schema.prisma" ||
      filename === "models.py" ||
      filename === "schema.py" ||
      lower.includes("/migrations/") ||
      lower.includes("/models/") ||
      lower.includes("/entities/")
    ) {
      return "DATABASE";
    }

    // API
    if (
      lower.includes("/api/") ||
      lower.includes("route.ts") ||
      lower.includes("route.js") ||
      lower.includes("controller") ||
      lower.includes("handlers/")
    ) {
      return "API";
    }

    // DOCUMENTATION
    if (filename.endsWith(".md") || filename.endsWith(".rst") || lower.includes("docs/")) {
      return "DOCUMENTATION";
    }

    // TEST
    if (
      lower.includes("/test/") ||
      lower.includes("/tests/") ||
      lower.includes("/__tests__/") ||
      filename.endsWith(".spec.ts") ||
      filename.endsWith(".test.tsx") ||
      filename.endsWith(".test.js") ||
      filename.endsWith("_test.go") ||
      filename.endsWith("_test.py")
    ) {
      return "TEST";
    }

    // STYLES
    if (filename.endsWith(".css") || filename.endsWith(".scss") || filename.endsWith(".less") || filename.endsWith(".module.css")) {
      return "STYLES";
    }

    // COMPONENT
    if (lower.includes("components/") || lower.includes("ui/") || lower.includes("widgets/")) {
      return "COMPONENT";
    }

    // UTILITY
    if (lower.includes("lib/") || lower.includes("utils/") || lower.includes("helpers/") || lower.includes("services/")) {
      return "UTILITY";
    }

    // SOURCE
    if (
      filename.endsWith(".ts") ||
      filename.endsWith(".tsx") ||
      filename.endsWith(".js") ||
      filename.endsWith(".jsx") ||
      filename.endsWith(".py") ||
      filename.endsWith(".go") ||
      filename.endsWith(".rs") ||
      filename.endsWith(".java") ||
      filename.endsWith(".cpp") ||
      filename.endsWith(".c") ||
      filename.endsWith(".php") ||
      filename.endsWith(".rb") ||
      filename.endsWith(".html")
    ) {
      return "SOURCE";
    }

    return "UNKNOWN";
  }

  public detectLanguages(fileList: AnalyzedFileMetadata[]): LanguageBreakdown[] {
    const counts: Record<string, number> = {};
    let totalSourceFiles = 0;

    const extToLang: Record<string, string> = {
      ".ts": "TypeScript",
      ".tsx": "TypeScript",
      ".js": "JavaScript",
      ".jsx": "JavaScript",
      ".mjs": "JavaScript",
      ".cjs": "JavaScript",
      ".py": "Python",
      ".go": "Go",
      ".rs": "Rust",
      ".java": "Java",
      ".cpp": "C++",
      ".cc": "C++",
      ".c": "C",
      ".h": "C",
      ".php": "PHP",
      ".rb": "Ruby",
      ".html": "HTML",
      ".css": "CSS",
      ".scss": "CSS",
      ".prisma": "Prisma Schema",
      ".json": "JSON",
      ".toml": "TOML",
      ".yml": "YAML",
      ".yaml": "YAML",
    };

    for (const f of fileList) {
      if (f.isIgnored) continue;
      const ext = f.extension.toLowerCase();
      const lang = extToLang[ext];
      if (lang) {
        counts[lang] = (counts[lang] || 0) + 1;
        totalSourceFiles++;
      }
    }

    if (totalSourceFiles === 0) return [];

    return Object.entries(counts)
      .map(([language, fileCount]) => ({
        language,
        fileCount,
        percentage: Math.round((fileCount / totalSourceFiles) * 1000) / 10,
      }))
      .sort((a, b) => b.fileCount - a.fileCount);
  }

  public parsePackageJson(content: string): ParsedManifestResult {
    const deps: DetectedDependency[] = [];
    const frameworks: string[] = [];
    const dbs: string[] = [];
    let packageManager = "npm";

    try {
      const parsed = JSON.parse(content);
      const mainDeps = parsed.dependencies || {};
      const devDeps = parsed.devDependencies || {};

      if (parsed.packageManager) {
        packageManager = String(parsed.packageManager).split("@")[0];
      }

      Object.entries(mainDeps).forEach(([name, version]) => {
        deps.push({ name, version: String(version), isDevDependency: false });
      });

      Object.entries(devDeps).forEach(([name, version]) => {
        deps.push({ name, version: String(version), isDevDependency: true });
      });

      const allDepNames = deps.map((d) => d.name);

      // Framework indicators
      if (allDepNames.includes("next")) frameworks.push("Next.js");
      if (allDepNames.includes("react")) frameworks.push("React");
      if (allDepNames.includes("vue")) frameworks.push("Vue.js");
      if (allDepNames.includes("nuxt")) frameworks.push("Nuxt.js");
      if (allDepNames.includes("@angular/core")) frameworks.push("Angular");
      if (allDepNames.includes("express")) frameworks.push("Express");
      if (allDepNames.includes("@nestjs/core")) frameworks.push("NestJS");
      if (allDepNames.includes("svelte") || allDepNames.includes("@sveltejs/kit")) frameworks.push("Svelte");

      // Database indicators
      if (allDepNames.includes("@prisma/client") || allDepNames.includes("prisma")) dbs.push("Prisma ORM");
      if (allDepNames.includes("pg") || allDepNames.includes("postgres")) dbs.push("PostgreSQL");
      if (allDepNames.includes("mongoose") || allDepNames.includes("mongodb")) dbs.push("MongoDB");
      if (allDepNames.includes("mysql") || allDepNames.includes("mysql2")) dbs.push("MySQL");
      if (allDepNames.includes("sqlite3") || allDepNames.includes("better-sqlite3")) dbs.push("SQLite");
      if (allDepNames.includes("redis") || allDepNames.includes("ioredis")) dbs.push("Redis");
    } catch {
      // Malformed JSON handled gracefully
    }

    return {
      manifestPath: "package.json",
      packageManager,
      dependencies: deps,
      frameworkIndicators: frameworks,
      databaseIndicators: dbs,
      runtime: "Node.js",
    };
  }

  public parseRequirementsTxt(content: string): ParsedManifestResult {
    const deps: DetectedDependency[] = [];
    const frameworks: string[] = [];
    const dbs: string[] = [];

    const lines = content.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const parts = trimmed.split(/[==>=<=~=]/);
      const name = parts[0].trim().toLowerCase();
      const version = parts[1] ? parts[1].trim() : "*";

      deps.push({ name, version, isDevDependency: false });

      if (name === "django") frameworks.push("Django");
      if (name === "flask") frameworks.push("Flask");
      if (name === "fastapi") frameworks.push("FastAPI");

      if (name === "psycopg2" || name === "psycopg2-binary" || name === "asyncpg") dbs.push("PostgreSQL");
      if (name === "pymongo") dbs.push("MongoDB");
      if (name === "redis") dbs.push("Redis");
      if (name === "sqlalchemy") dbs.push("SQLAlchemy ORM");
    }

    return {
      manifestPath: "requirements.txt",
      packageManager: "pip",
      dependencies: deps,
      frameworkIndicators: frameworks,
      databaseIndicators: dbs,
      runtime: "Python",
    };
  }

  public parsePyprojectToml(content: string): ParsedManifestResult {
    const frameworks: string[] = [];
    const dbs: string[] = [];
    const deps: DetectedDependency[] = [];

    if (content.includes("django")) frameworks.push("Django");
    if (content.includes("flask")) frameworks.push("Flask");
    if (content.includes("fastapi")) frameworks.push("FastAPI");

    if (content.includes("psycopg") || content.includes("asyncpg")) dbs.push("PostgreSQL");
    if (content.includes("pymongo")) dbs.push("MongoDB");
    if (content.includes("sqlalchemy")) dbs.push("SQLAlchemy ORM");

    return {
      manifestPath: "pyproject.toml",
      packageManager: "poetry/pip",
      dependencies: deps,
      frameworkIndicators: frameworks,
      databaseIndicators: dbs,
      runtime: "Python",
    };
  }

  public parseCargoToml(content: string): ParsedManifestResult {
    const frameworks: string[] = [];
    const dbs: string[] = [];

    if (content.includes("actix-web")) frameworks.push("Actix Web");
    if (content.includes("axum")) frameworks.push("Axum");
    if (content.includes("rocket")) frameworks.push("Rocket");

    if (content.includes("diesel")) dbs.push("Diesel ORM");
    if (content.includes("sqlx")) dbs.push("SQLx");
    if (content.includes("postgres")) dbs.push("PostgreSQL");

    return {
      manifestPath: "Cargo.toml",
      packageManager: "cargo",
      dependencies: [],
      frameworkIndicators: frameworks,
      databaseIndicators: dbs,
      runtime: "Rust",
    };
  }

  public parseGoMod(content: string): ParsedManifestResult {
    const frameworks: string[] = [];
    const dbs: string[] = [];

    if (content.includes("github.com/gin-gonic/gin")) frameworks.push("Gin");
    if (content.includes("github.com/gofiber/fiber")) frameworks.push("Fiber");
    if (content.includes("github.com/labstack/echo")) frameworks.push("Echo");

    if (content.includes("gorm.io/gorm")) dbs.push("GORM");
    if (content.includes("github.com/lib/pq")) dbs.push("PostgreSQL");

    return {
      manifestPath: "go.mod",
      packageManager: "go modules",
      dependencies: [],
      frameworkIndicators: frameworks,
      databaseIndicators: dbs,
      runtime: "Go",
    };
  }

  public parsePrismaSchema(content: string): DetectedDbModel[] {
    const models: DetectedDbModel[] = [];
    const modelBlocks = content.split(/model\s+/);

    for (let i = 1; i < modelBlocks.length; i++) {
      const block = modelBlocks[i];
      const match = block.match(/^([A-Za-z0-9_]+)\s*\{([^}]*)\}/);
      if (match) {
        const modelName = match[1];
        const body = match[2];
        const lines = body
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l && !l.startsWith("//") && !l.startsWith("@@"));

        models.push({
          name: modelName,
          fieldsCount: lines.length,
          sourceFile: "prisma/schema.prisma",
        });
      }
    }

    return models;
  }

  public detectFramework(
    fileMetadataList: AnalyzedFileMetadata[],
    manifestResults: ParsedManifestResult[]
  ): DetectedFramework | undefined {
    const filePaths = fileMetadataList.map((f) => f.path.toLowerCase());
    const frameworkIndicators = manifestResults.flatMap((m) => m.frameworkIndicators);

    // Next.js
    if (
      frameworkIndicators.includes("Next.js") ||
      filePaths.some((p) => p.includes("next.config")) ||
      filePaths.some((p) => p.startsWith("app/") || p.startsWith("src/app/"))
    ) {
      return {
        name: "Next.js",
        version: "15.x",
        confidence: 0.98,
        indicatorsFound: ["Next.js dependency", "App Router structure", "next.config"],
      };
    }

    // Express
    if (frameworkIndicators.includes("Express")) {
      return {
        name: "Express.js",
        confidence: 0.9,
        indicatorsFound: ["express dependency"],
      };
    }

    // NestJS
    if (frameworkIndicators.includes("NestJS")) {
      return {
        name: "NestJS",
        confidence: 0.95,
        indicatorsFound: ["@nestjs/core dependency"],
      };
    }

    // React
    if (frameworkIndicators.includes("React")) {
      return {
        name: "React",
        confidence: 0.9,
        indicatorsFound: ["react dependency"],
      };
    }

    // Django
    if (frameworkIndicators.includes("Django") || filePaths.some((p) => p.endsWith("manage.py"))) {
      return {
        name: "Django",
        confidence: 0.95,
        indicatorsFound: ["django dependency", "manage.py"],
      };
    }

    // Flask
    if (frameworkIndicators.includes("Flask")) {
      return {
        name: "Flask",
        confidence: 0.9,
        indicatorsFound: ["flask dependency"],
      };
    }

    // FastAPI
    if (frameworkIndicators.includes("FastAPI")) {
      return {
        name: "FastAPI",
        confidence: 0.95,
        indicatorsFound: ["fastapi dependency"],
      };
    }

    // Actix
    if (frameworkIndicators.includes("Actix Web")) {
      return {
        name: "Actix Web",
        confidence: 0.95,
        indicatorsFound: ["actix-web dependency"],
      };
    }

    // Gin
    if (frameworkIndicators.includes("Gin")) {
      return {
        name: "Gin",
        confidence: 0.95,
        indicatorsFound: ["gin-gonic dependency"],
      };
    }

    return undefined;
  }

  public detectApiRoutes(fileMetadataList: AnalyzedFileMetadata[]): DetectedApiRoute[] {
    const routes: DetectedApiRoute[] = [];

    for (const f of fileMetadataList) {
      if (f.isIgnored) continue;
      const lower = f.path.toLowerCase();

      // Next.js App Router API Routes
      if (lower.includes("app/api/") && (lower.endsWith("/route.ts") || lower.endsWith("/route.js"))) {
        let routePath = "/" + f.path.replace(/^.*app\//, "").replace(/\/route\.(ts|js)$/, "");
        routes.push({
          path: routePath,
          handlerFile: f.path,
        });
      }
      // Next.js Pages Router API Routes
      else if (lower.includes("pages/api/") && (lower.endsWith(".ts") || lower.endsWith(".js"))) {
        let routePath = "/" + f.path.replace(/^.*pages\//, "").replace(/\.(ts|js)$/, "");
        routes.push({
          path: routePath,
          handlerFile: f.path,
        });
      }
      // Express / Controller Files
      else if (f.category === "API") {
        routes.push({
          path: `/${f.name.replace(/\.[^/.]+$/, "")}`,
          handlerFile: f.path,
        });
      }
    }

    return routes;
  }

  public async analyzeRepositoryTree(
    projectId: string,
    fileNodes: Array<{ path: string; size?: number; type?: string }>,
    manifestContents: Record<string, string> = {}
  ): Promise<CodebaseAnalysisResult> {
    const metadataList: AnalyzedFileMetadata[] = [];
    let ignoredCount = 0;
    let sourceCount = 0;
    let estimatedTotalBytes = 0;

    for (const file of fileNodes) {
      if (file.type === "dir") continue;

      const size = file.size || 0;
      const ignoreCheck = this.isIgnoredFile(file.path, size);
      const ext = file.path.includes(".") ? `.${file.path.split(".").pop()}` : "";
      const name = file.path.split(/[/\\]/).pop() || file.path;
      const category = this.categorizeFile(file.path);

      if (ignoreCheck.isIgnored) {
        ignoredCount++;
      } else {
        if (category === "SOURCE" || category === "API" || category === "COMPONENT" || category === "UTILITY") {
          sourceCount++;
          estimatedTotalBytes += size;
        }
      }

      metadataList.push({
        path: file.path,
        name,
        extension: ext,
        sizeBytes: size,
        category,
        isIgnored: ignoreCheck.isIgnored,
        ignoreReason: ignoreCheck.reason,
      });
    }

    // 1. Language Breakdown
    const languages = this.detectLanguages(metadataList);

    // 2. Manifest Parsers
    const manifestResults: ParsedManifestResult[] = [];
    let packageManagers: string[] = [];
    let allDependencies: DetectedDependency[] = [];
    let allDatabases: string[] = [];

    if (manifestContents["package.json"]) {
      const res = this.parsePackageJson(manifestContents["package.json"]);
      manifestResults.push(res);
      if (res.packageManager) packageManagers.push(res.packageManager);
      allDependencies.push(...res.dependencies);
      allDatabases.push(...res.databaseIndicators);
    }

    if (manifestContents["requirements.txt"]) {
      const res = this.parseRequirementsTxt(manifestContents["requirements.txt"]);
      manifestResults.push(res);
      if (res.packageManager) packageManagers.push(res.packageManager);
      allDependencies.push(...res.dependencies);
      allDatabases.push(...res.databaseIndicators);
    }

    if (manifestContents["pyproject.toml"]) {
      const res = this.parsePyprojectToml(manifestContents["pyproject.toml"]);
      manifestResults.push(res);
      allDatabases.push(...res.databaseIndicators);
    }

    if (manifestContents["Cargo.toml"]) {
      const res = this.parseCargoToml(manifestContents["Cargo.toml"]);
      manifestResults.push(res);
      if (res.packageManager) packageManagers.push(res.packageManager);
      allDatabases.push(...res.databaseIndicators);
    }

    if (manifestContents["go.mod"]) {
      const res = this.parseGoMod(manifestContents["go.mod"]);
      manifestResults.push(res);
      if (res.packageManager) packageManagers.push(res.packageManager);
      allDependencies.push(...res.dependencies);
      allDatabases.push(...res.databaseIndicators);
    }

    // 3. Framework Detection
    const framework = this.detectFramework(metadataList, manifestResults);

    // 4. API Routes Detection
    const apiRoutes = this.detectApiRoutes(metadataList);

    // 5. Database Models Detection
    let databaseModels: DetectedDbModel[] = [];
    if (manifestContents["prisma/schema.prisma"]) {
      databaseModels = this.parsePrismaSchema(manifestContents["prisma/schema.prisma"]);
    } else {
      const dbFiles = metadataList.filter((f) => f.category === "DATABASE" && !f.isIgnored);
      databaseModels = dbFiles.map((f) => ({
        name: f.name.replace(/\.[^/.]+$/, ""),
        fieldsCount: 5,
        sourceFile: f.path,
      }));
    }

    const databases = Array.from(new Set(allDatabases));

    // 6. Documentation Files
    const docFiles = metadataList
      .filter((f) => f.category === "DOCUMENTATION" && !f.isIgnored)
      .map((f) => f.path);

    // 7. Feature Highlights
    const detectedFeatures: string[] = [];
    if (apiRoutes.length > 0) detectedFeatures.push(`${apiRoutes.length} API Routes Detected`);
    if (databaseModels.length > 0) detectedFeatures.push(`${databaseModels.length} Database Models`);
    if (framework) detectedFeatures.push(`${framework.name} Framework`);
    if (docFiles.includes("README.md")) detectedFeatures.push("README Documentation");

    // 8. Warnings
    const analysisWarnings: string[] = [];
    if (!docFiles.includes("README.md")) {
      analysisWarnings.push("No root README.md found in repository.");
    }
    if (manifestResults.length === 0) {
      analysisWarnings.push("No package manifest file (package.json, requirements.txt, etc.) found.");
    }

    const estimatedLinesOfCode = Math.round(estimatedTotalBytes / 35) || sourceCount * 120;

    return {
      projectId,
      analyzedAt: new Date(),
      totalFileCount: fileNodes.filter((f) => f.type !== "dir").length,
      sourceFileCount: sourceCount,
      scannedFilesCount: metadataList.length - ignoredCount,
      ignoredFileCount: ignoredCount,
      estimatedLinesOfCode,
      languages,
      framework,
      packageManagers: Array.from(new Set(packageManagers)),
      dependencies: allDependencies,
      apiRoutes,
      databases,
      databaseModels,
      documentationFiles: docFiles,
      detectedFeatures,
      analysisWarnings,
      fileMetadataList: metadataList,
      status: "COMPLETED",
    };
  }
}

export const codebaseAnalyzerService = new CodebaseAnalyzerService();
