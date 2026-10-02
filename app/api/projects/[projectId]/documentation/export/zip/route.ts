import { NextRequest, NextResponse } from "next/server";
import { exportZipBundle } from "@/lib/documentation/export";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    if (!projectId) {
      return NextResponse.json({ success: false, error: "Project ID is required" }, { status: 400 });
    }

    const { filename, buffer } = await exportZipBundle(projectId);

    return new NextResponse(buffer, {
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
