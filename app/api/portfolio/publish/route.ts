import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePortfolioCache } from "@/lib/portfolio/cache";

export async function POST() {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to publish your portfolio." },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Check user and readiness requirements
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        profile: { select: { fullName: true } },
        portfolioSettings: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User record not found." },
        { status: 404 }
      );
    }

    if (!user.username) {
      return NextResponse.json(
        { error: "Cannot publish yet. Please choose a unique username first." },
        { status: 400 }
      );
    }

    const publishedAt = user.portfolioSettings?.publishedAt || new Date();

    const updatedSettings = await prisma.portfolioSettings.upsert({
      where: { userId },
      update: {
        isPublished: true,
        publishedAt,
      },
      create: {
        userId,
        template: "MODERN",
        isPublished: true,
        publishedAt,
      },
    });

    revalidatePortfolioCache({ userId, username: user.username });

    return NextResponse.json({
      message: "✓ Your portfolio is now live!",
      isPublished: true,
      publishedAt: updatedSettings.publishedAt,
      settings: updatedSettings,
    });
  } catch (error) {
    console.error("POST /api/portfolio/publish error:", error);
    return NextResponse.json(
      { error: "Failed to publish portfolio. Please try again." },
      { status: 500 }
    );
  }
}
