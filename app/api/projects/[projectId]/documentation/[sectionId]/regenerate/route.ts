import { NextRequest, NextResponse } from "next/server";
import { documentationPipelineService } from "@/lib/documentation/pipeline";
import { DocSectionKey } from "@/lib/documentation/types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; sectionId: string }> }
) {
  try {
    const { projectId, sectionId } = await params;

    const result = await documentationPipelineService.regenerateSingleSection(
      projectId,
      sectionId as DocSectionKey
    );

    return NextResponse.json({
      success: true,
      message: `Section '${sectionId}' regenerated successfully.`,
      data: result,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to regenerate documentation section.";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 400 }
    );
  }
}
