import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePortfolioCache } from "@/lib/portfolio/cache";

export async function POST() {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to manage your portfolio." },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const existingSettings = await prisma.portfolioSettings.findUnique({
      where: { userId },
    });

    if (!existingSettings) {
      return NextResponse.json(
        { error: "Portfolio settings not found." },
        { status: 404 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true },
    });

    const updatedSettings = await prisma.portfolioSettings.update({
      where: { userId },
      data: {
        isPublished: false,
      },
    });

    // Invalidate public portfolio cache so unpublished portfolio is immediately 404/hidden
    revalidatePortfolioCache({ userId, username: user?.username });

    return NextResponse.json({
      message: "✓ Portfolio unpublished successfully.",
      isPublished: false,
      settings: updatedSettings,
    });
  } catch (error) {
    console.error("POST /api/portfolio/unpublish error:", error);
    return NextResponse.json(
      { error: "Failed to unpublish portfolio. Please try again." },
      { status: 500 }
    );
  }
}
