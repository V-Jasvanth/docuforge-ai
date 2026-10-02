const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkDuplicates() {
  console.log("Checking DocumentationSection table for duplicate (documentationId, key) pairs...\n");
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

    console.log(`Duplicate sets count: ${rawDuplicates.length}`);

    if (rawDuplicates.length > 0) {
      console.log("⚠️ Duplicate records identified:");
      for (const dup of rawDuplicates) {
        console.log(`  - documentationId: ${dup.documentationId}, key: ${dup.key}, count: ${dup._count.id}`);
      }
    } else {
      console.log("✅ Zero duplicate (documentationId, key) pairs found in the database.");
    }

    const count = await prisma.documentationSection.count();
    console.log(`Total sections in database: ${count}`);
  } catch (err) {
    console.log("Database status note:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDuplicates();
