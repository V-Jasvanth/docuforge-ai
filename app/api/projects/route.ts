import { NextRequest, NextResponse } from "next/server";
import { createProjectSchema } from "@/lib/validation";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  try {
    // Demo / Foundation query response
    const mockProjects = [
      {
        id: "demo-1",
        name: "FlowBoard SaaS",
        description: "Interactive kanban and workflow management platform",
        status: "READY",
        framework: "Next.js",
        docVersion: "1.0.0",
        createdAt: new Date().toISOString(),
      },
    ];

    return NextResponse.json({
      success: true,
      data: mockProjects,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch projects list",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Zod Validation
    const validationResult = createProjectSchema.safeParse(body);
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

    const { name, repositoryUrl, branch, framework, description } = validationResult.data;

    // 2. Foundation Creation Logic
    const newProject = {
      id: `proj_${Date.now()}`,
      name,
      repositoryUrl,
      branch,
      framework: framework || "Next.js",
      description: description || null,
      status: "ANALYZING",
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        message: "Project created and queued for codebase analysis",
        data: newProject,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error creating project",
      },
      { status: 500 }
    );
  }
}
