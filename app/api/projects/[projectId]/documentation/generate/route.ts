import { NextRequest, NextResponse } from "next/server";
import { documentationPipelineService } from "@/lib/documentation/pipeline";
import { getAuthenticatedUser, validateProjectOwnership } from "@/lib/auth/utils";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const user = await getAuthenticatedUser(req);

    const ownership = await validateProjectOwnership(projectId, user.id);
    if (!ownership.isOwner) {
      return NextResponse.json({ success: false, error: ownership.error }, { status: ownership.status });
    }

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
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
