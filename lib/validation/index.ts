import { z } from "zod";

export interface ParsedGitHubUrl {
  owner: string;
  repo: string;
  url: string;
}

export function parseGitHubUrl(inputUrl: string): ParsedGitHubUrl | null {
  if (!inputUrl || typeof inputUrl !== "string") return null;
  let trimmed = inputUrl.trim();
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    trimmed = `https://${trimmed}`;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.hostname.toLowerCase() !== "github.com") {
      return null;
    }
    const segments = parsed.pathname.split("/").filter(Boolean);
    if (segments.length < 2) return null;

    const owner = segments[0];
    let repo = segments[1];

    if (repo.endsWith(".git")) {
      repo = repo.slice(0, -4);
    }

    if (!/^[a-zA-Z0-9_.-]+$/.test(owner) || !/^[a-zA-Z0-9_.-]+$/.test(repo)) {
      return null;
    }

    return {
      owner,
      repo,
      url: `https://github.com/${owner}/${repo}`,
    };
  } catch {
    return null;
  }
}

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const createProjectSchema = z.object({
  name: z.string().min(2, "Project name must be at least 2 characters").max(50),
  description: z.string().max(300).optional(),
  repositoryUrl: z
    .string()
    .min(1, "Repository URL is required")
    .refine((url) => parseGitHubUrl(url) !== null, {
      message: "Please enter a valid GitHub repository URL (e.g. https://github.com/owner/repository)",
    }),
  branch: z.string().min(1, "Branch name is required").default("main"),
  framework: z.string().optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  description: z.string().max(300).optional(),
  branch: z.string().optional(),
  framework: z.string().optional(),
});

export const updateDocSectionSchema = z.object({
  sectionKey: z.string(),
  content: z.string().min(10, "Documentation section content cannot be empty"),
  title: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type UpdateDocSectionInput = z.infer<typeof updateDocSectionSchema>;
