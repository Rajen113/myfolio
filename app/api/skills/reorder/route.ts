import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePortfolioCache } from "@/lib/portfolio/cache";

// PATCH /api/skills/reorder — Update display orders for user's skills
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
    const { skillIds } = await req.json();

    if (!Array.isArray(skillIds)) {
      return NextResponse.json(
        { error: "Invalid request data. Expected skillIds array." },
        { status: 400 }
      );
    }

    // Verify all skillIds belong to the authenticated user
    const existingSkills = await prisma.skill.findMany({
      where: {
        id: { in: skillIds },
        userId,
      },
      select: { id: true },
    });

    if (existingSkills.length !== skillIds.length) {
      return NextResponse.json(
        { error: "One or more skills do not belong to you or do not exist." },
        { status: 403 }
      );
    }

    // Perform transaction to update displayOrder based on index
    await prisma.$transaction(
      skillIds.map((id: string, index: number) =>
        prisma.skill.update({
          where: { id },
          data: { displayOrder: index },
        })
      )
    );

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true },
    });
    revalidatePortfolioCache({ userId, username: user?.username });

    return NextResponse.json({
      success: true,
      message: "Skill ordering updated successfully",
    });
  } catch (error) {
    console.error("PATCH /api/skills/reorder error:", error);
    return NextResponse.json(
      { error: "Failed to reorder skills" },
      { status: 500 }
    );
  }
}
