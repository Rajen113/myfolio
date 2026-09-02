import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePortfolioCache } from "@/lib/portfolio/cache";

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
    const body = await req.json();

    if (!body || !Array.isArray(body.experienceIds)) {
      return NextResponse.json(
        { error: "Invalid payload. Expected experienceIds array." },
        { status: 400 }
      );
    }

    const experienceIds: string[] = body.experienceIds;

    // Verify all IDs belong to user
    const userExperiences = await prisma.experience.findMany({
      where: {
        userId,
        id: { in: experienceIds },
      },
      select: { id: true },
    });

    if (userExperiences.length !== experienceIds.length) {
      return NextResponse.json(
        { error: "One or more experience records do not belong to you." },
        { status: 403 }
      );
    }

    // Execute bulk update in transaction
    const updateOperations = experienceIds.map((id, index) =>
      prisma.experience.update({
        where: { id },
        data: { displayOrder: index },
      })
    );

    await prisma.$transaction(updateOperations);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true },
    });
    revalidatePortfolioCache({ userId, username: user?.username });

    return NextResponse.json({
      message: "Experience display order updated successfully.",
    });
  } catch (error) {
    console.error("PATCH /api/experience/reorder error:", error);
    return NextResponse.json(
      { error: "Failed to update experience order." },
      { status: 500 }
    );
  }
}
