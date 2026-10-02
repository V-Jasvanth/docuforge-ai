import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    if (!projectId) {
      return NextResponse.json({ success: false, error: "Project ID is required" }, { status: 400 });
    }

    const versions = await prisma.documentationVersion.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ success: true, data: versions });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch documentation versions";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
