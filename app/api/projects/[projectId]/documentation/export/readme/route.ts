import { NextRequest, NextResponse } from "next/server";
import { exportReadme } from "@/lib/documentation/export";
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

    const { filename, content } = await exportReadme(projectId);

    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to export README";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
