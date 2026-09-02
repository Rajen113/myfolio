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

    if (!body || !Array.isArray(body.educationIds)) {
      return NextResponse.json(
        { error: "Invalid payload. Expected educationIds array." },
        { status: 400 }
      );
    }

    const educationIds: string[] = body.educationIds;

    // Verify ownership of all IDs
    const userEducation = await prisma.education.findMany({
      where: {
        userId,
        id: { in: educationIds },
      },
      select: { id: true },
    });

    if (userEducation.length !== educationIds.length) {
      return NextResponse.json(
        { error: "One or more education records do not belong to you." },
        { status: 403 }
      );
    }

    // Update display orders in transaction
    const updateOperations = educationIds.map((id, index) =>
      prisma.education.update({
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
      message: "Education display order updated successfully.",
    });
  } catch (error) {
    console.error("PATCH /api/education/reorder error:", error);
    return NextResponse.json(
      { error: "Failed to update education order." },
      { status: 500 }
    );
  }
}
