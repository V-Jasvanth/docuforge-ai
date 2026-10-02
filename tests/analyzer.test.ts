import assert from "node:assert";
import { parseGitHubUrl } from "../lib/validation";
import { codebaseAnalyzerService } from "../lib/analyzer/service";

export function runAnalyzerTests() {
  console.log("🧪 Running DocuForge AI Codebase Analyzer Unit Tests...\n");

  // Test 1: GitHub URL Parsing
  console.log("Test 1: GitHub URL Parsing");
  const valid1 = parseGitHubUrl("https://github.com/facebook/react");
  assert.strictEqual(valid1?.owner, "facebook");
  assert.strictEqual(valid1?.repo, "react");

  const valid2 = parseGitHubUrl("https://github.com/vercel/next.js.git");
  assert.strictEqual(valid2?.owner, "vercel");
  assert.strictEqual(valid2?.repo, "next.js");

  const valid3 = parseGitHubUrl("github.com/expressjs/express");
  assert.strictEqual(valid3?.owner, "expressjs");
  assert.strictEqual(valid3?.repo, "express");

  assert.strictEqual(parseGitHubUrl("https://gitlab.com/user/repo"), null);
  assert.strictEqual(parseGitHubUrl("invalid-url-string"), null);
  console.log("  ✓ GitHub URL Parsing tests passed!\n");

  // Test 2: File Filtering
  console.log("Test 2: File Filtering");
  assert.strictEqual(codebaseAnalyzerService.isIgnoredFile("node_modules/react/index.js").isIgnored, true);
  assert.strictEqual(codebaseAnalyzerService.isIgnoredFile(".next/server/app.js").isIgnored, true);
  assert.strictEqual(codebaseAnalyzerService.isIgnoredFile("coverage/lcov.info").isIgnored, true);
  assert.strictEqual(codebaseAnalyzerService.isIgnoredFile("assets/image.png").isIgnored, true);
  assert.strictEqual(codebaseAnalyzerService.isIgnoredFile("package.json").isIgnored, false);
  assert.strictEqual(codebaseAnalyzerService.isIgnoredFile("src/app/page.tsx").isIgnored, false);
  console.log("  ✓ File Filtering tests passed!\n");

  // Test 3: File Categorization
  console.log("Test 3: File Categorization");
  assert.strictEqual(codebaseAnalyzerService.categorizeFile("package.json"), "CONFIG");
  assert.strictEqual(codebaseAnalyzerService.categorizeFile("prisma/schema.prisma"), "DATABASE");
  assert.strictEqual(codebaseAnalyzerService.categorizeFile("app/api/users/route.ts"), "API");
  assert.strictEqual(codebaseAnalyzerService.categorizeFile("README.md"), "DOCUMENTATION");
  assert.strictEqual(codebaseAnalyzerService.categorizeFile("components/Button.tsx"), "COMPONENT");
  assert.strictEqual(codebaseAnalyzerService.categorizeFile("src/index.ts"), "SOURCE");
  console.log("  ✓ File Categorization tests passed!\n");

  // Test 4: Manifest Parsing (package.json)
  console.log("Test 4: Manifest Parsing (package.json)");
  const pkgJson = JSON.stringify({
    name: "test-app",
    dependencies: {
      next: "15.0.0",
      react: "19.0.0",
      "@prisma/client": "6.0.0",
    },
    devDependencies: {
      typescript: "5.0.0",
    },
  });

  const parsedPkg = codebaseAnalyzerService.parsePackageJson(pkgJson);
  assert.strictEqual(parsedPkg.dependencies.length, 4);
  assert.deepStrictEqual(parsedPkg.frameworkIndicators, ["Next.js", "React"]);
  assert.deepStrictEqual(parsedPkg.databaseIndicators, ["Prisma ORM"]);
  console.log("  ✓ package.json Manifest Parsing tests passed!\n");

  // Test 5: Requirements.txt Parsing
  console.log("Test 5: Requirements.txt Parsing");
  const reqTxt = "fastapi==0.100.0\npsycopg2-binary==2.9.6\nuvicorn==0.22.0\n";
  const parsedReq = codebaseAnalyzerService.parseRequirementsTxt(reqTxt);
  assert.strictEqual(parsedReq.dependencies.length, 3);
  assert.deepStrictEqual(parsedReq.frameworkIndicators, ["FastAPI"]);
  assert.deepStrictEqual(parsedReq.databaseIndicators, ["PostgreSQL"]);
  console.log("  ✓ requirements.txt Parsing tests passed!\n");

  // Test 6: Language Detection
  console.log("Test 6: Language Detection");
  const mockFiles = [
    { path: "src/app.ts", name: "app.ts", extension: ".ts", sizeBytes: 100, category: "SOURCE" as const, isIgnored: false },
    { path: "src/button.tsx", name: "button.tsx", extension: ".tsx", sizeBytes: 200, category: "SOURCE" as const, isIgnored: false },
    { path: "main.py", name: "main.py", extension: ".py", sizeBytes: 150, category: "SOURCE" as const, isIgnored: false },
    { path: "node_modules/x.js", name: "x.js", extension: ".js", sizeBytes: 50, category: "SOURCE" as const, isIgnored: true },
  ];

  const langs = codebaseAnalyzerService.detectLanguages(mockFiles);
  assert.strictEqual(langs.length, 2);
  assert.strictEqual(langs[0].language, "TypeScript");
  assert.strictEqual(langs[0].fileCount, 2);
  assert.strictEqual(langs[1].language, "Python");
  assert.strictEqual(langs[1].fileCount, 1);
  console.log("  ✓ Language Detection tests passed!\n");

  console.log("🎉 All DocuForge AI Codebase Analyzer Unit Tests Passed Successfully!");
}

if (require.main === module) {
  runAnalyzerTests();
}
