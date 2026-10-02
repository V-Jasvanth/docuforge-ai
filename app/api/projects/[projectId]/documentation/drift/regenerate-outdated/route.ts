import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { documentationPipelineService } from "@/lib/documentation/pipeline";
import type { DocSectionKey } from "@/lib/documentation/types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    if (!projectId) {
      return NextResponse.json({ success: false, error: "Project ID is required" }, { status: 400 });
    }

    const doc = await prisma.documentation.findFirst({
      where: { projectId },
      include: {
        sections: {
          where: {
            status: { in: ["OUTDATED", "NEEDS_REVIEW"] },
          },
        },
      },
    });

    if (!doc || doc.sections.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No outdated or review-needed sections found.",
        regeneratedCount: 0,
      });
    }

    const regeneratedSections: string[] = [];

    for (const section of doc.sections) {
      await documentationPipelineService.regenerateSingleSection(
        projectId,
        section.key as DocSectionKey
      );
      regeneratedSections.push(section.key);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully regenerated ${regeneratedSections.length} outdated section(s).`,
      regeneratedCount: regeneratedSections.length,
      sections: regeneratedSections,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to regenerate outdated sections";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
