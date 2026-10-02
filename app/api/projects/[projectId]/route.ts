import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAuthenticatedUser, validateProjectOwnership } from "@/lib/auth/utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const user = await getAuthenticatedUser(req);

    const ownership = await validateProjectOwnership(projectId, user.id);
    if (!ownership.isOwner || !ownership.project) {
      return NextResponse.json(
        { success: false, error: ownership.error },
        { status: ownership.status }
      );
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        repository: true,
        analyses: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            analysisFiles: {
              take: 100,
            },
          },
        },
        documentations: {
          include: {
            sections: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    const latestAnalysis = project?.analyses[0] || null;

    return NextResponse.json({
      success: true,
      data: {
        project,
        latestAnalysis,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch project details";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
