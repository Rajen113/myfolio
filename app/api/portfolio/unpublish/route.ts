import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const updatedSettings = await prisma.portfolioSettings.update({
      where: { userId },
      data: {
        isPublished: false,
      },
    });

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
