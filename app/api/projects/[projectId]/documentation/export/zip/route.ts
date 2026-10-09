import { NextRequest, NextResponse } from "next/server";
import { exportZipBundle } from "@/lib/documentation/export";
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

    const { filename, buffer } = await exportZipBundle(projectId);

    // Convert Node.js Buffer to Uint8Array for NextResponse BodyInit compatibility
    const responseBody = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);

    return new NextResponse(responseBody, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to export ZIP bundle";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
