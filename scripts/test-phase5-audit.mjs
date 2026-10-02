import assert from "node:assert";
import { normalizeFilePath, mapImpactToDocSections } from "../lib/documentation/drift.ts";
import { validateProjectOwnership } from "../lib/auth/utils.ts";

async function runPhase5AuditSuite() {
  console.log("🛡️ Running DocuForge AI Phase 5 Quality Hardening & Production Audit Suite...\n");

  // 1. Path Normalization Audit
  console.log("Test 1: Path Normalization Audit");
  assert.strictEqual(normalizeFilePath("app\\api\\users\\route.ts"), "app/api/users/route.ts");
  assert.strictEqual(normalizeFilePath("/src/index.ts"), "src/index.ts");
  assert.strictEqual(normalizeFilePath("  \\\\prisma\\\\schema.prisma  "), "prisma/schema.prisma");
  console.log("  ✓ Windows & POSIX path normalization verified!\n");

  // 2. Input Parameter & Ownership Guard Audit
  console.log("Test 2: Input Parameter & Ownership Guard");
  const invalidIdTest = await validateProjectOwnership("", "user-123");
  assert.strictEqual(invalidIdTest.isOwner, false);
  assert.strictEqual(invalidIdTest.status, 400);
  console.log("  ✓ Ownership authorization & parameter validation verified!\n");

  // 3. Impact Mapping Deduplication & Edge Cases
  console.log("Test 3: Impact Mapping Edge Cases & Deduplication");
  const windowsChanges = [
    { path: "app\\api\\projects\\route.ts", status: "MODIFIED" },
    { path: "prisma\\schema.prisma", status: "MODIFIED" },
    { path: ".env.local", status: "ADDED" },
  ];
  const impacts = mapImpactToDocSections(windowsChanges);
  const apiImpact = impacts.find((i) => i.sectionKey === "api_reference");
  const dbImpact = impacts.find((i) => i.sectionKey === "database");
  const envImpact = impacts.find((i) => i.sectionKey === "environment_variables");

  assert.notStrictEqual(apiImpact, undefined);
  assert.notStrictEqual(dbImpact, undefined);
  assert.notStrictEqual(envImpact, undefined);
  assert.strictEqual(apiImpact.changedFiles.includes("app/api/projects/route.ts"), true);
  console.log("  ✓ Cross-platform path impact mapping verified!\n");

  console.log("🎉 All Phase 5 Production Readiness Audits Passed Cleanly!");
}

runPhase5AuditSuite().catch((err) => {
  console.error("❌ Phase 5 audit failed:", err);
  process.exit(1);
});
