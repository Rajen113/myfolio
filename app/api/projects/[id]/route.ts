import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { projectSchema } from "@/lib/validations/project";
import { revalidatePortfolioCache } from "@/lib/portfolio/cache";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/projects/[id] — Get single project by ID for authenticated owner
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const userId = session.user.id;

    const project = await prisma.project.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error("GET /api/projects/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

// PATCH /api/projects/[id] — Update project by ID for authenticated owner
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const userId = session.user.id;

    // Check ownership
    const existingProject = await prisma.project.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const body = await req.json();

    // Partial parse or full parse depending on payload
    const validationResult = projectSchema.partial().safeParse(body);

    if (!validationResult.success) {
      const issue = validationResult.error.issues[0];
      return NextResponse.json(
        { error: issue ? issue.message : "Invalid project update data" },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.image !== undefined && { image: data.image || null }),
        ...(data.liveUrl !== undefined && { liveUrl: data.liveUrl || null }),
        ...(data.githubUrl !== undefined && { githubUrl: data.githubUrl || null }),
        ...(data.technologies !== undefined && { technologies: data.technologies }),
        ...(data.featured !== undefined && { featured: data.featured }),
        ...(data.displayOrder !== undefined && { displayOrder: data.displayOrder }),
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true },
    });
    revalidatePortfolioCache({ userId, username: user?.username });

    return NextResponse.json({
      success: true,
      message: "Project updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    console.error("PATCH /api/projects/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] — Delete project by ID for authenticated owner
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const userId = session.user.id;

    // Check ownership
    const existingProject = await prisma.project.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    await prisma.project.delete({
      where: { id },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true },
    });
    revalidatePortfolioCache({ userId, username: user?.username });

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/projects/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
