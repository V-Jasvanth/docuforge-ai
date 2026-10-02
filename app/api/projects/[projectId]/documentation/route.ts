import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;

    const documentation = await prisma.documentation.findFirst({
      where: { projectId },
      include: {
        sections: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!documentation) {
      return NextResponse.json({
        success: true,
        data: null,
        message: "No documentation records generated yet.",
      });
    }

    return NextResponse.json({
      success: true,
      data: documentation,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch project documentation";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
