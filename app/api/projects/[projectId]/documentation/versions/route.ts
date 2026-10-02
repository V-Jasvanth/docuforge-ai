import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAuthenticatedUser, validateProjectOwnership } from "@/lib/auth/utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const user = await getAuthenticatedUser(request);

    const ownership = await validateProjectOwnership(projectId, user.id);
    if (!ownership.isOwner) {
      return NextResponse.json({ success: false, error: ownership.error }, { status: ownership.status });
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
