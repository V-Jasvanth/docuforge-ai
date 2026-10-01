import { z } from "zod";

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
  name: z.string().min(3, "Project name must be at least 3 characters").max(50),
  description: z.string().max(300).optional(),
  repositoryUrl: z
    .string()
    .url("Please enter a valid repository URL")
    .refine((url) => url.includes("github.com"), {
      message: "Only GitHub repositories are supported currently",
    }),
  branch: z.string().min(1, "Branch name is required").default("main"),
  framework: z.string().optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(3).max(50).optional(),
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
