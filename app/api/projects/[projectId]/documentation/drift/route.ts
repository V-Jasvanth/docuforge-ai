import { NextRequest, NextResponse } from "next/server";
import { analyzeAndUpdateProjectDrift } from "@/lib/documentation/drift";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    if (!projectId) {
      return NextResponse.json({ success: false, error: "Project ID is required" }, { status: 400 });
    }

    const driftResult = await analyzeAndUpdateProjectDrift(projectId);
    return NextResponse.json({ success: true, data: driftResult });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to perform drift analysis";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    if (!projectId) {
      return NextResponse.json({ success: false, error: "Project ID is required" }, { status: 400 });
    }

    const driftResult = await analyzeAndUpdateProjectDrift(projectId);
    return NextResponse.json({ success: true, data: driftResult });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to run drift check";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
