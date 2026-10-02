import { prisma } from "../lib/db/prisma.ts";

async function inspectDatabaseConstraint() {
  console.log("🔍 Inspecting database for potential duplicate DocumentationSection(documentationId, key) records...\n");

  try {
    const rawDuplicates = await prisma.documentationSection.groupBy({
      by: ["documentationId", "key"],
      _count: {
        id: true,
      },
      having: {
        id: {
          _count: {
            gt: 1,
          },
        },
      },
    });

    console.log(`Duplicate sets found: ${rawDuplicates.length}`);

    if (rawDuplicates.length > 0) {
      console.log("⚠️ WARNING: The following (documentationId, key) duplicate sets were found in the database:");
      for (const dup of rawDuplicates) {
        console.log(`  - documentationId: ${dup.documentationId}, key: ${dup.key}, count: ${dup._count.id}`);
      }
    } else {
      console.log("✅ Zero duplicate (documentationId, key) pairs found in DocumentationSection table.");
    }

    const totalSections = await prisma.documentationSection.count();
    console.log(`Total DocumentationSection records in database: ${totalSections}`);
  } catch (err) {
    console.log("Note: Database connection or query check details:", err instanceof Error ? err.message : String(err));
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}

inspectDatabaseConstraint();
