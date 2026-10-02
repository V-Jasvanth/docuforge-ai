import { NextRequest, NextResponse } from "next/server";
import { documentationPipelineService } from "@/lib/documentation/pipeline";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;

    const result = await documentationPipelineService.generateDocumentationForProject({
      projectId,
    });

    return NextResponse.json({
      success: true,
      message: "Documentation generated successfully.",
      data: result,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to generate project documentation.";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 400 }
    );
  }
}
