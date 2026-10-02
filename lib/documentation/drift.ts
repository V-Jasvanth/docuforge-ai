import type { DocSectionKey } from "./types.ts";
import { STANDARD_DOC_SECTIONS } from "./types.ts";
import type { CodebaseAnalysisResult } from "../analyzer/types.ts";

export interface FileChange {
  path: string;
  status: "ADDED" | "REMOVED" | "MODIFIED";
  oldSize?: number;
  newSize?: number;
}

export interface SectionImpact {
  sectionKey: DocSectionKey;
  sectionTitle: string;
  reasons: string[];
  changedFiles: string[];
}

export interface DetailedDriftAnalysis {
  projectId: string;
  isDriftDetected: boolean;
  fileChanges: FileChange[];
  affectedSections: SectionImpact[];
  checkedAt: Date;
  summary: string;
}

export function compareAnalyses(
  prevAnalysis: CodebaseAnalysisResult,
  currentAnalysis: CodebaseAnalysisResult
): FileChange[] {
  const changes: FileChange[] = [];
  const prevFileMap = new Map<string, { size?: number }>();
  const currFileMap = new Map<string, { size?: number }>();

  if (prevAnalysis.filesTree && Array.isArray(prevAnalysis.filesTree)) {
    prevAnalysis.filesTree.forEach((f) => prevFileMap.set(f.path, { size: f.size }));
  }
  if (currentAnalysis.filesTree && Array.isArray(currentAnalysis.filesTree)) {
    currentAnalysis.filesTree.forEach((f) => currFileMap.set(f.path, { size: f.size }));
  }

  // Detect added or modified files
  for (const [path, curr] of currFileMap.entries()) {
    if (!prevFileMap.has(path)) {
      changes.push({ path, status: "ADDED", newSize: curr.size });
    } else {
      const prev = prevFileMap.get(path)!;
      if (prev.size !== undefined && curr.size !== undefined && prev.size !== curr.size) {
        changes.push({ path, status: "MODIFIED", oldSize: prev.size, newSize: curr.size });
      }
    }
  }

  // Detect removed files
  for (const [path, prev] of prevFileMap.entries()) {
    if (!currFileMap.has(path)) {
      changes.push({ path, status: "REMOVED", oldSize: prev.size });
    }
  }

  return changes;
}

export function mapImpactToDocSections(changes: FileChange[]): SectionImpact[] {
  const impactMap = new Map<DocSectionKey, { reasons: Set<string>; changedFiles: Set<string> }>();

  const getImpact = (key: DocSectionKey) => {
    if (!impactMap.has(key)) {
      impactMap.set(key, { reasons: new Set(), changedFiles: new Set() });
    }
    return impactMap.get(key)!;
  };

  for (const change of changes) {
    const p = change.path.toLowerCase();
    const statusLabel = change.status.toLowerCase();

    // API Reference
    if (p.includes("/api/") || p.includes("route.") || p.includes("controller") || p.includes("endpoint")) {
      const imp = getImpact("api_reference");
      imp.changedFiles.add(change.path);
      imp.reasons.add(`API route or controller file ${change.path} was ${statusLabel}.`);
    }

    // Database Architecture
    if (p.includes("schema.prisma") || p.includes("/models/") || p.includes("/migrations/") || p.includes("/db/") || p.includes("entity")) {
      const imp = getImpact("database");
      imp.changedFiles.add(change.path);
      imp.reasons.add(`Database schema/model file ${change.path} was ${statusLabel}.`);
    }

    // Environment Variables
    if (p.includes(".env") || p.includes("config/env") || p.includes("env.ts") || p.includes("env.js") || p.includes("env.mjs")) {
      const imp = getImpact("environment_variables");
      imp.changedFiles.add(change.path);
      imp.reasons.add(`Environment configuration file ${change.path} was ${statusLabel}.`);
    }

    // Configuration
    if (
      p.endsWith("package.json") ||
      p.endsWith("tsconfig.json") ||
      p.includes("config.") ||
      p.endsWith("docker-compose.yml") ||
      p.includes(".eslintrc")
    ) {
      const imp = getImpact("configuration");
      imp.changedFiles.add(change.path);
      imp.reasons.add(`Configuration file ${change.path} was ${statusLabel}.`);
    }

    // Installation
    if (
      p.endsWith("package.json") ||
      p.endsWith("package-lock.json") ||
      p.endsWith("pnpm-lock.yaml") ||
      p.endsWith("yarn.lock") ||
      p.endsWith("requirements.txt") ||
      p.endsWith("cargo.toml") ||
      p.endsWith("go.mod")
    ) {
      const imp = getImpact("installation");
      imp.changedFiles.add(change.path);
      imp.reasons.add(`Package manifest/lock file ${change.path} was ${statusLabel}.`);
    }

    // Deployment
    if (
      p.includes("dockerfile") ||
      p.includes("docker-compose") ||
      p.includes(".github/workflows") ||
      p.includes("vercel.json") ||
      p.includes("netlify.toml") ||
      p.includes("render.yaml")
    ) {
      const imp = getImpact("deployment");
      imp.changedFiles.add(change.path);
      imp.reasons.add(`Deployment/CI file ${change.path} was ${statusLabel}.`);
    }

    // Development Guide
    if (p.endsWith("package.json") || p.includes("makefile") || p.includes("jest") || p.includes("vitest")) {
      const imp = getImpact("development");
      imp.changedFiles.add(change.path);
      imp.reasons.add(`Development script or test configuration ${change.path} was ${statusLabel}.`);
    }

    // Contribution Guide
    if (p.includes("contributing") || p.includes("pull_request_template") || p.includes("code_of_conduct")) {
      const imp = getImpact("contributing");
      imp.changedFiles.add(change.path);
      imp.reasons.add(`Contribution guideline ${change.path} was ${statusLabel}.`);
    }

    // README / Project Overview
    if (p.includes("readme") || p.includes("changelog")) {
      const impReadme = getImpact("readme");
      impReadme.changedFiles.add(change.path);
      impReadme.reasons.add(`Repository README/changelog ${change.path} was ${statusLabel}.`);

      const impOverview = getImpact("overview");
      impOverview.changedFiles.add(change.path);
      impOverview.reasons.add(`Repository overview file ${change.path} was ${statusLabel}.`);
    }

    // Troubleshooting
    if (p.includes("faq") || p.includes("troubleshooting")) {
      const imp = getImpact("troubleshooting");
      imp.changedFiles.add(change.path);
      imp.reasons.add(`Troubleshooting guide ${change.path} was ${statusLabel}.`);
    }

    // Architecture & Folder Structure (structural directory changes)
    if (change.status === "ADDED" || change.status === "REMOVED") {
      const impArch = getImpact("architecture");
      impArch.changedFiles.add(change.path);
      impArch.reasons.add(`Structural code change: ${change.path} was ${statusLabel}.`);

      const impFolder = getImpact("folder_structure");
      impFolder.changedFiles.add(change.path);
      impFolder.reasons.add(`Directory tree change: ${change.path} was ${statusLabel}.`);
    }
  }

  const results: SectionImpact[] = [];
  for (const [key, data] of impactMap.entries()) {
    const spec = STANDARD_DOC_SECTIONS.find((s) => s.key === key);
    results.push({
      sectionKey: key,
      sectionTitle: spec?.title || key,
      reasons: Array.from(data.reasons),
      changedFiles: Array.from(data.changedFiles),
    });
  }

  return results;
}

export async function analyzeAndUpdateProjectDrift(projectId: string): Promise<DetailedDriftAnalysis> {
  const { prisma } = await import("../db/prisma.ts");
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      analyses: {
        where: { status: "COMPLETED" },
        orderBy: { createdAt: "desc" },
        take: 2,
      },
      documentations: {
        include: { sections: true },
      },
    },
  });

  if (!project) {
    throw new Error(`Project '${projectId}' not found.`);
  }

  const completedAnalyses = project.analyses;
  if (completedAnalyses.length < 2) {
    return {
      projectId,
      isDriftDetected: false,
      fileChanges: [],
      affectedSections: [],
      checkedAt: new Date(),
      summary: "Insufficient analysis history to detect drift. At least two repository scans are required.",
    };
  }

  const currentAnalysis = completedAnalyses[0].summary as unknown as CodebaseAnalysisResult;
  const prevAnalysis = completedAnalyses[1].summary as unknown as CodebaseAnalysisResult;

  const fileChanges = compareAnalyses(prevAnalysis, currentAnalysis);
  const affectedSections = mapImpactToDocSections(fileChanges);

  const isDriftDetected = fileChanges.length > 0 && affectedSections.length > 0;

  if (isDriftDetected && project.documentations.length > 0) {
    const doc = project.documentations[0];
    const affectedKeys = affectedSections.map((s) => s.sectionKey);

    // Update section status to OUTDATED in database
    await prisma.documentationSection.updateMany({
      where: {
        documentationId: doc.id,
        key: { in: affectedKeys },
      },
      data: {
        status: "OUTDATED",
      },
    });

    // Record drift activity
    await prisma.activity.create({
      data: {
        projectId,
        userId: project.userId,
        type: "DRIFT_DETECTED",
        title: "Documentation Drift Detected",
        description: `Detected potential drift in ${affectedSections.length} section(s) from ${fileChanges.length} changed file(s).`,
        metadata: {
          fileChangesCount: fileChanges.length,
          affectedSectionsCount: affectedSections.length,
          affectedSections: affectedKeys,
        },
      },
    });
  }

  const summary = isDriftDetected
    ? `Detected documentation drift across ${affectedSections.length} section(s) based on ${fileChanges.length} file change(s).`
    : fileChanges.length > 0
    ? `${fileChanges.length} file(s) changed, but no documentation impact was identified.`
    : "Documentation is fully up to date with repository state.";

  return {
    projectId,
    isDriftDetected,
    fileChanges,
    affectedSections,
    checkedAt: new Date(),
    summary,
  };
}
