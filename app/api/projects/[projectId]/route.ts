import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;

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

    if (!project) {
      return NextResponse.json(
        { success: false, error: `Project '${projectId}' not found.` },
        { status: 404 }
      );
    }

    const latestAnalysis = project.analyses[0] || null;

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
