import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { updateDocSectionSchema } from "@/lib/validation";
import { sanitizeText } from "@/lib/documentation/sanitizer";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; sectionId: string }> }
) {
  try {
    const { projectId, sectionId } = await params;
    const body = await req.json();

    const validationResult = updateDocSectionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { content, title } = validationResult.data;
    const sanitized = sanitizeText(content);

    // Find section in DB
    const section = await prisma.documentationSection.findFirst({
      where: {
        key: sectionId,
        documentation: {
          projectId,
        },
      },
    });

    if (!section) {
      return NextResponse.json(
        { success: false, error: `Documentation section '${sectionId}' not found.` },
        { status: 404 }
      );
    }

    const updated = await prisma.documentationSection.update({
      where: { id: section.id },
      data: {
        content: sanitized,
        title: title || section.title,
        status: "GENERATED",
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Documentation section updated successfully.",
      data: updated,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update documentation section.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
