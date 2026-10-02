// Real Repository Integration Test
async function testRealRepository() {
  console.log("🌐 Testing Real Public GitHub Repository Analysis...\n");
  const targetOwner = "expressjs";
  const targetRepo = "express";

  try {
    console.log(`1. Fetching Metadata for ${targetOwner}/${targetRepo}...`);
    const metaRes = await fetch(`https://api.github.com/repos/${targetOwner}/${targetRepo}`, {
      headers: { "User-Agent": "DocuForge-AI-Tester", Accept: "application/vnd.github.v3+json" },
    });
    if (!metaRes.ok) throw new Error(`HTTP ${metaRes.status}: ${metaRes.statusText}`);
    const metadata = await metaRes.json();

    console.log(`   ✓ Found Repository: ${metadata.full_name}`);
    console.log(`   ✓ Default Branch: ${metadata.default_branch}`);
    console.log(`   ✓ Primary Language: ${metadata.language}`);

    console.log(`\n2. Fetching Recursive File Tree for branch '${metadata.default_branch}'...`);
    const treeRes = await fetch(`https://api.github.com/repos/${targetOwner}/${targetRepo}/git/trees/${metadata.default_branch}?recursive=1`, {
      headers: { "User-Agent": "DocuForge-AI-Tester", Accept: "application/vnd.github.v3+json" },
    });
    if (!treeRes.ok) throw new Error(`HTTP ${treeRes.status}: ${treeRes.statusText}`);
    const treeData = await treeRes.json();
    console.log(`   ✓ Retrieved ${treeData.tree.length} total nodes in file tree.`);

    console.log(`\n3. Fetching package.json manifest content...`);
    const rawRes = await fetch(`https://raw.githubusercontent.com/${targetOwner}/${targetRepo}/${metadata.default_branch}/package.json`);
    const pkgContent = await rawRes.text();
    const pkgJson = JSON.parse(pkgContent);
    console.log(`   ✓ package.json fetched (${pkgContent.length} bytes). Name: "${pkgJson.name}".`);

    console.log(`\n4. Simulating Codebase Analyzer Engine processing...`);
    const ignoredDirs = ["node_modules", ".git", "coverage", "test"];
    let ignoredCount = 0;
    let sourceCount = 0;

    treeData.tree.forEach((item) => {
      if (item.type === "tree") return;
      const isIgnored = ignoredDirs.some((d) => item.path.includes(d));
      if (isIgnored) ignoredCount++;
      else sourceCount++;
    });

    console.log("\n📊 Real Analysis Summary Results:");
    console.log(`   • Repository Name: ${metadata.full_name}`);
    console.log(`   • Total File Nodes: ${treeData.tree.length}`);
    console.log(`   • Scanned Source Files: ${sourceCount}`);
    console.log(`   • Filtered Ignored Files: ${ignoredCount}`);
    console.log(`   • Primary Dependencies: ${Object.keys(pkgJson.dependencies || {}).join(", ")}`);
    console.log(`   • Dev Dependencies: ${Object.keys(pkgJson.devDependencies || {}).length} packages`);
    console.log(`   • License: ${pkgJson.license || "MIT"}`);

    console.log("\n✅ Real GitHub Repository (expressjs/express) Integration Test Passed Successfully!");
  } catch (error) {
    console.error("❌ Real Repository Integration Test Failed:", error);
    process.exit(1);
  }
}

testRealRepository();
