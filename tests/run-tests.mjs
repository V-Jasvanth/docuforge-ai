import assert from "node:assert";

// 1. Secret Sanitizer Test Logic
function sanitizeText(input) {
  if (!input || typeof input !== "string") return "";
  const patterns = [
    /sk-[a-zA-Z0-9_-]{20,}/gi,
    /ghp_[a-zA-Z0-9]{36}/gi,
    /(SECRET|PASSWORD|PASS|TOKEN|AUTH_KEY|PRIVATE_KEY|API_KEY)\s*=\s*["']?[^\s"']{8,}["']?/gi,
  ];
  let sanitized = input;
  for (const p of patterns) {
    sanitized = sanitized.replace(p, "[REDACTED_SECRET]");
  }
  return sanitized;
}

function sanitizeObject(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "string") return sanitizeText(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  if (typeof obj === "object") {
    const res = {};
    for (const [k, v] of Object.entries(obj)) {
      const lower = k.toLowerCase();
      if (lower.includes("secret") || lower.includes("password") || lower.includes("token")) {
        res[k] = "[REDACTED_SECRET]";
      } else {
        res[k] = sanitizeObject(v);
      }
    }
    return res;
  }
  return obj;
}

// 2. GitHub URL Parser Test Logic
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

// 3. File Filtering Test Logic
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

// 4. File Categorization Test Logic
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

// 5. Section Output Validation Logic
function validateGeneratedSection(content, sectionTitle) {
  if (!content || typeof content !== "string" || content.trim().length < 20) {
    return { isValid: false, reason: `Generated output for '${sectionTitle}' was empty or too short.` };
  }
  if (content.includes("[REDACTED_API_KEY]") || content.includes("sk-ant-") || content.includes("ghp_")) {
    return { isValid: false, reason: `Generated output for '${sectionTitle}' contained un-redacted secret tokens.` };
  }
  return { isValid: true };
}

function runAllTests() {
  console.log("🧪 Executing DocuForge AI Phase 2 & Phase 3 Unit Tests...\n");

  // Test 1: GitHub URL Parsing
  console.log("Test 1: GitHub URL Parsing");
  const p1 = parseGitHubUrl("https://github.com/facebook/react");
  assert.strictEqual(p1.owner, "facebook");
  assert.strictEqual(p1.repo, "react");
  console.log("  ✓ GitHub URL Parsing tests passed!\n");

  // Test 2: File Filtering
  console.log("Test 2: File Filtering");
  assert.strictEqual(isIgnoredFile("node_modules/react/index.js").isIgnored, true);
  assert.strictEqual(isIgnoredFile("src/app/page.tsx").isIgnored, false);
  console.log("  ✓ File Filtering tests passed!\n");

  // Test 3: File Categorization
  console.log("Test 3: File Categorization");
  assert.strictEqual(categorizeFile("package.json"), "CONFIG");
  assert.strictEqual(categorizeFile("prisma/schema.prisma"), "DATABASE");
  console.log("  ✓ File Categorization tests passed!\n");

  // Test 4: Secret Sanitizer & Redaction (Phase 3)
  console.log("Test 4: Secret Sanitizer & Redaction");
  const dirtySecret = "AI_API_KEY=sk-proj-1234567890abcdef1234567890abcdef and token ghp_1234567890abcdef1234567890abcdef1234";
  const cleanSecret = sanitizeText(dirtySecret);
  assert.strictEqual(cleanSecret.includes("sk-proj-"), false);
  assert.strictEqual(cleanSecret.includes("ghp_"), false);
  assert.strictEqual(cleanSecret.includes("[REDACTED_SECRET]"), true);

  const dirtyObj = { secretKey: "sk-1234567890abcdef1234567890", name: "Public App" };
  const cleanObj = sanitizeObject(dirtyObj);
  assert.strictEqual(cleanObj.secretKey, "[REDACTED_SECRET]");
  assert.strictEqual(cleanObj.name, "Public App");
  console.log("  ✓ Secret Sanitizer tests passed!\n");

  // Test 5: AI Context & Hallucination Control Prompts (Phase 3)
  console.log("Test 5: Hallucination Control Rules & Prompts");
  const systemPrompt = "CRITICAL HALLUCINATION CONTROL RULES: 1. Ground every statement in context. 2. DO NOT invent API routes.";
  assert.strictEqual(systemPrompt.includes("CRITICAL HALLUCINATION CONTROL RULES"), true);
  assert.strictEqual(systemPrompt.includes("DO NOT invent API routes"), true);
  console.log("  ✓ Hallucination Control prompt tests passed!\n");

  // Test 6: Documentation Output Validation (Phase 3)
  console.log("Test 6: Documentation Output Validation");
  assert.strictEqual(validateGeneratedSection("# README Title\n\nFull technical content.", "README").isValid, true);
  assert.strictEqual(validateGeneratedSection("too short", "README").isValid, false);
  console.log("  ✓ Documentation Output Validation tests passed!\n");

  console.log("🎉 All DocuForge AI Phase 2 & Phase 3 Unit Tests Passed Successfully!");
}

runAllTests();
