import { NextRequest, NextResponse } from "next/server";
import { exportPdf } from "@/lib/documentation/export";
import {
  getAuthenticatedUser,
  validateProjectOwnership,
} from "@/lib/auth/utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const user = await getAuthenticatedUser(request);

    const ownership = await validateProjectOwnership(projectId, user.id);

    if (!ownership.isOwner) {
      return NextResponse.json(
        { success: false, error: ownership.error },
        { status: ownership.status }
      );
    }

    const { filename, buffer } = await exportPdf(projectId);

    // Convert the Node.js Buffer to a standard ArrayBuffer for NextResponse.
    const responseBody = new ArrayBuffer(buffer.byteLength);
    new Uint8Array(responseBody).set(buffer);

    return new NextResponse(responseBody, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.byteLength.toString(),
      },
    });
  } catch (err: unknown) {
    const msg =
      err instanceof Error
        ? err.message
        : "Failed to export PDF documentation";

    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
