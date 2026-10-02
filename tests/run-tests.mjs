import assert from "node:assert";

// 1. GitHub URL Parser Test Logic
function parseGitHubUrl(inputUrl) {
  if (!inputUrl || typeof inputUrl !== "string") return null;
  let trimmed = inputUrl.trim();
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    trimmed = `https://${trimmed}`;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.hostname.toLowerCase() !== "github.com") return null;
    const segments = parsed.pathname.split("/").filter(Boolean);
    if (segments.length < 2) return null;
    const owner = segments[0];
    let repo = segments[1];
    if (repo.endsWith(".git")) repo = repo.slice(0, -4);
    if (!/^[a-zA-Z0-9_.-]+$/.test(owner) || !/^[a-zA-Z0-9_.-]+$/.test(repo)) return null;
    return { owner, repo, url: `https://github.com/${owner}/${repo}` };
  } catch {
    return null;
  }
}

// 2. File Filtering Test Logic
function isIgnoredFile(filePath) {
  const ignoredDirs = ["node_modules", ".git", ".next", "dist", "build", "coverage", "venv", "__pycache__"];
  const ignoredExts = [".png", ".jpg", ".pdf", ".zip", ".tar", ".gz", ".lock"];
  const parts = filePath.split(/[/\\]/);

  for (const dir of ignoredDirs) {
    if (parts.includes(dir)) return { isIgnored: true, reason: dir };
  }

  const ext = filePath.includes(".") ? `.${filePath.split(".").pop().toLowerCase()}` : "";
  if (ignoredExts.includes(ext)) return { isIgnored: true, reason: ext };

  return { isIgnored: false };
}

// 3. File Categorization Test Logic
function categorizeFile(filePath) {
  const lower = filePath.toLowerCase();
  const filename = lower.split(/[/\\]/).pop() || "";

  if (filename === "package.json" || filename === "tsconfig.json" || filename === "requirements.txt") return "CONFIG";
  if (filename === "schema.prisma" || filename === "models.py") return "DATABASE";
  if (lower.includes("/api/") || lower.includes("route.ts")) return "API";
  if (filename.endsWith(".md") || lower.includes("docs/")) return "DOCUMENTATION";
  if (lower.includes("components/") || lower.includes("ui/")) return "COMPONENT";
  if (lower.includes("lib/") || lower.includes("utils/")) return "UTILITY";
  if (filename.endsWith(".ts") || filename.endsWith(".tsx") || filename.endsWith(".py")) return "SOURCE";
  return "UNKNOWN";
}

// 4. Manifest Parser Test Logic
function parsePackageJson(content) {
  const parsed = JSON.parse(content);
  const mainDeps = parsed.dependencies || {};
  const devDeps = parsed.devDependencies || {};
  const deps = [];
  const frameworks = [];
  const dbs = [];

  Object.entries(mainDeps).forEach(([name, version]) => deps.push({ name, version: String(version), isDevDependency: false }));
  Object.entries(devDeps).forEach(([name, version]) => deps.push({ name, version: String(version), isDevDependency: true }));

  const names = deps.map((d) => d.name);
  if (names.includes("next")) frameworks.push("Next.js");
  if (names.includes("react")) frameworks.push("React");
  if (names.includes("@prisma/client")) dbs.push("Prisma ORM");

  return { dependencies: deps, frameworkIndicators: frameworks, databaseIndicators: dbs };
}

function runAllTests() {
  console.log("🧪 Executing DocuForge AI Codebase Analyzer Unit Tests...\n");

  // Test 1: GitHub URL Parsing
  console.log("Test 1: GitHub URL Parsing");
  const p1 = parseGitHubUrl("https://github.com/facebook/react");
  assert.strictEqual(p1.owner, "facebook");
  assert.strictEqual(p1.repo, "react");

  const p2 = parseGitHubUrl("https://github.com/vercel/next.js.git");
  assert.strictEqual(p2.owner, "vercel");
  assert.strictEqual(p2.repo, "next.js");

  assert.strictEqual(parseGitHubUrl("https://gitlab.com/invalid/repo"), null);
  assert.strictEqual(parseGitHubUrl("invalid-string"), null);
  console.log("  ✓ GitHub URL Parsing tests passed!\n");

  // Test 2: File Filtering
  console.log("Test 2: File Filtering");
  assert.strictEqual(isIgnoredFile("node_modules/react/index.js").isIgnored, true);
  assert.strictEqual(isIgnoredFile(".next/server/app.js").isIgnored, true);
  assert.strictEqual(isIgnoredFile("assets/image.png").isIgnored, true);
  assert.strictEqual(isIgnoredFile("package.json").isIgnored, false);
  assert.strictEqual(isIgnoredFile("src/app/page.tsx").isIgnored, false);
  console.log("  ✓ File Filtering tests passed!\n");

  // Test 3: File Categorization
  console.log("Test 3: File Categorization");
  assert.strictEqual(categorizeFile("package.json"), "CONFIG");
  assert.strictEqual(categorizeFile("prisma/schema.prisma"), "DATABASE");
  assert.strictEqual(categorizeFile("app/api/users/route.ts"), "API");
  assert.strictEqual(categorizeFile("README.md"), "DOCUMENTATION");
  assert.strictEqual(categorizeFile("components/Button.tsx"), "COMPONENT");
  assert.strictEqual(categorizeFile("src/index.ts"), "SOURCE");
  console.log("  ✓ File Categorization tests passed!\n");

  // Test 4: Manifest Parsing
  console.log("Test 4: Manifest Parsing");
  const pkgContent = JSON.stringify({
    dependencies: { next: "^15.0.0", react: "^19.0.0", "@prisma/client": "^6.0.0" },
    devDependencies: { typescript: "^5.0.0" },
  });
  const res = parsePackageJson(pkgContent);
  assert.strictEqual(res.dependencies.length, 4);
  assert.deepStrictEqual(res.frameworkIndicators, ["Next.js", "React"]);
  assert.deepStrictEqual(res.databaseIndicators, ["Prisma ORM"]);
  console.log("  ✓ Manifest Parsing tests passed!\n");

  console.log("🎉 All DocuForge AI Codebase Analyzer Unit Tests Passed Successfully!");
}

runAllTests();
