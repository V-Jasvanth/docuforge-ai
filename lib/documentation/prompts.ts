import type { DocSectionKey } from "./types";
import type { SectionAiContext } from "./context";

export interface PromptPair {
  systemPrompt: string;
  userPrompt: string;
}

export class DocumentationPromptBuilder {
  private getSystemPrompt(): string {
    return `You are DocuForge AI, a senior software architect and technical writer.
Your task is to generate high-quality, professional developer documentation for a software project based STRICTLY on the provided repository analysis context.

CRITICAL HALLUCINATION CONTROL RULES:
1. Ground every statement, code snippet, configuration, and model description in the supplied project analysis context.
2. DO NOT invent API routes, endpoints, HTTP methods, or parameters that do not exist in the context.
3. DO NOT invent database tables, models, columns, or relationships not supported by context evidence.
4. DO NOT invent dependencies, environment variables, deployment platforms, or credentials.
5. If specific details for a topic are missing from the context, state explicitly: "The repository analysis does not provide explicit evidence for this section."
6. Prefer "Not detected in repository analysis" over fabrication.
7. Format output in clean, professional GitHub-Flavored Markdown (GFM). Use appropriate headings, tables, code blocks, and lists. Do not include raw HTML script tags.`;
  }

  public buildPromptPair(sectionKey: DocSectionKey, context: SectionAiContext): PromptPair {
    const systemPrompt = this.getSystemPrompt();
    const contextJson = JSON.stringify(context, null, 2);

    let userInstruction = "";

    switch (sectionKey) {
      case "readme":
        userInstruction = `Generate a concise, professional root README.md for "${context.projectName}".
Include:
- Project Title & Tagline/Purpose
- Tech Stack Overview (${context.framework || "Detected Stack"}, ${(context.primaryLanguages || []).slice(0, 3).join(", ")})
- Key Features (${(context.detectedFeatures || []).join(" · ") || "Codebase Features"})
- Quick Start Guide (Prerequisites, setup commands based on package manager: ${(context.packageManagers || []).join(", ") || "npm"})
- Project Repository Link (${context.repository?.url || "https://github.com"})`;
        break;

      case "overview":
        userInstruction = `Generate a comprehensive Project Overview for "${context.projectName}".
Include:
- Executive Summary & System Purpose
- Primary Technologies (${(context.primaryLanguages || []).join(", ")})
- Detected Framework & ORM (${context.framework || "N/A"})
- Core Architecture Features (${(context.detectedFeatures || []).join(", ")})
- Repository Metadata (${context.repository?.owner}/${context.repository?.name} on branch '${context.repository?.branch}')`;
        break;

      case "architecture":
        userInstruction = `Generate an Architecture Guide for "${context.projectName}".
Include:
- High-level Architectural Overview
- System Components & Layer Breakdown (API layer, Database layer, Component layer based on scanned files)
- Technology Stack Integration (${context.framework || "Standard Architecture"}, ${(context.primaryLanguages || []).join(", ")})
- Component & Directory Responsibilities based on file structure evidence`;
        break;

      case "installation":
        userInstruction = `Generate an Installation & Setup Guide for "${context.projectName}".
Include:
- System Prerequisites (Node.js/Python/Go runtime matching ${context.primaryLanguages?.[0] || "JavaScript"})
- Package Installation steps using detected package managers: ${(context.packageManagers || []).join(", ") || "npm"}
- Initializing local environment and database scripts
- Running the local development server`;
        break;

      case "environment_variables":
        userInstruction = `Generate an Environment Variables Guide for "${context.projectName}".
Include:
- Required & Optional Environment Variables based strictly on repository evidence
- Configuration instructions (.env template)
- Security Best Practices (Do not commit secrets)`;
        break;

      case "api_reference":
        userInstruction = `Generate an API Reference Guide for "${context.projectName}".
Include:
- Summary of Detected API Endpoints (${(context.apiRoutes || []).length} route handlers found)
- Endpoint Table (Path, Handler File)
- Detail each detected route handler file cleanly based on analysis evidence.
If 0 routes were detected, state that no API route handlers were found in the current codebase analysis.`;
        break;

      case "database":
        userInstruction = `Generate a Database Architecture Guide for "${context.projectName}".
Include:
- Database Technologies (${(context.databases || []).join(", ") || "Detected ORM/Database"})
- Entity/Model Overview (${(context.databaseModels || []).length} models detected)
- Detailed Model Table (Model Name, Field Count, Source File) based on schema evidence
If no database models were detected, clearly indicate "No database models or ORM schemas detected in repository analysis."`;
        break;

      case "folder_structure":
        userInstruction = `Generate a Folder Structure Guide for "${context.projectName}".
Include:
- Codebase Directory Tree Breakdown based on file metadata
- Explanation of key directories (app, components, lib, prisma, etc.)
- Architectural conventions demonstrated in file layout`;
        break;

      case "configuration":
        userInstruction = `Generate a Configuration Guide for "${context.projectName}".
Include:
- Framework & Build Configuration (${context.framework || "Config Files"})
- Tooling Configurations (TypeScript, Tailwind, ESLint if detected in context)
- Customization options based on repository manifest files`;
        break;

      case "deployment":
        userInstruction = `Generate a Production Deployment Guide for "${context.projectName}".
Include:
- Production Build Commands (matching package manager: ${context.packageManagers?.[0] || "npm"})
- Deployment Platform Recommendations suitable for ${context.framework || "this stack"}
- Environment configuration & production database considerations`;
        break;

      case "development":
        userInstruction = `Generate a Local Development Guide for "${context.projectName}".
Include:
- Developer Workflow & Daily Scripts
- Code Style & Linting Guidelines
- Testing & Code Verification procedures`;
        break;

      case "troubleshooting":
        userInstruction = `Generate a Troubleshooting & FAQ Guide for "${context.projectName}".
Include:
- Common Installation & Environment Setup Issues
- Database Connection / Migration Troubleshooting
- Framework & Build Error Resolution Steps`;
        break;

      case "contributing":
        userInstruction = `Generate a Contribution Guide for "${context.projectName}".
Include:
- Pull Request Workflow & Branch Conventions
- Code Review Guidelines
- Issue Reporting and Code Quality Standards`;
        break;

      default:
        userInstruction = `Generate documentation section for ${sectionKey}.`;
        break;
    }

    const userPrompt = `### REPOSITORY ANALYSIS CONTEXT:
\`\`\`json
${contextJson}
\`\`\`

### SECTION INSTRUCTION:
${userInstruction}`;

    return { systemPrompt, userPrompt };
  }
}

export const documentationPromptBuilder = new DocumentationPromptBuilder();
