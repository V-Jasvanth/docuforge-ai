import type { NextRequest } from "next/server";

export interface AuthenticatedUser {
  id: string;
  name?: string | null;
  email: string;
}

export async function getAuthenticatedUser(req?: NextRequest): Promise<AuthenticatedUser> {
  const { prisma } = await import("../db/prisma.ts");
  try {
    const { getServerSession } = await import("next-auth");
    const { authOptions } = await import("./options.ts");
    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (dbUser) {
        return {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
        };
      }
    }
  } catch {
    // Graceful fallback to default demo user if NextAuth session context is uninitialized
  }

  let defaultUser = await prisma.user.findFirst();
  if (!defaultUser) {
    defaultUser = await prisma.user.create({
      data: {
        name: "Alex Vance",
        email: "demo@docuforge.ai",
        passwordHash: "$2b$10$demo_hash_placeholder",
      },
    });
  }

  return {
    id: defaultUser.id,
    name: defaultUser.name,
    email: defaultUser.email,
  };
}

export async function validateProjectOwnership(projectId: string, userId: string) {
  if (!projectId || typeof projectId !== "string" || projectId.trim() === "") {
    return { isOwner: false, error: "Invalid Project ID format.", status: 400, project: null };
  }

  const { prisma } = await import("../db/prisma.ts");
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { repository: true },
  });

  if (!project) {
    return { isOwner: false, error: `Project '${projectId}' not found.`, status: 404, project: null };
  }

  if (project.userId !== userId) {
    return { isOwner: false, error: "Unauthorized access to project.", status: 403, project: null };
  }

  return { isOwner: true, error: null, status: 200, project };
}
