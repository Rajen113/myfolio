import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/projects/reorder — Update display orders for user's projects
export async function PATCH(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { projectIds } = await req.json();

    if (!Array.isArray(projectIds)) {
      return NextResponse.json(
        { error: "Invalid request data. Expected projectIds array." },
        { status: 400 }
      );
    }

    // Verify all projectIds belong to the authenticated user
    const existingProjects = await prisma.project.findMany({
      where: {
        id: { in: projectIds },
        userId,
      },
      select: { id: true },
    });

    if (existingProjects.length !== projectIds.length) {
      return NextResponse.json(
        { error: "One or more projects do not belong to you or do not exist." },
        { status: 403 }
      );
    }

    // Perform transaction to update displayOrder based on index
    await prisma.$transaction(
      projectIds.map((id: string, index: number) =>
        prisma.project.update({
          where: { id },
          data: { displayOrder: index },
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: "Project ordering updated successfully",
    });
  } catch (error) {
    console.error("PATCH /api/projects/reorder error:", error);
    return NextResponse.json(
      { error: "Failed to reorder projects" },
      { status: 500 }
    );
  }
}
