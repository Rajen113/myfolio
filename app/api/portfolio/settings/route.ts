import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { portfolioSettingsSchema } from "@/lib/validations/portfolio-settings";
import { DEFAULT_CUSTOMIZATION } from "@/lib/constants/portfolio-customization";
import { revalidatePortfolioCache } from "@/lib/portfolio/cache";

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Fetch existing portfolio settings or create default
    let settings = await prisma.portfolioSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      settings = await prisma.portfolioSettings.create({
        data: {
          userId,
          template: "MODERN",
          ...DEFAULT_CUSTOMIZATION,
        },
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("GET /api/portfolio/settings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch portfolio settings." },
      { status: 500 }
    );
  }
}

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

    const validation = portfolioSettingsSchema.safeParse(body);

    if (!validation.success) {
      const firstIssue = validation.error.issues[0];
      return NextResponse.json(
        { error: firstIssue ? firstIssue.message : "Invalid input data." },
        { status: 400 }
      );
    }

    const dataToUpdate = validation.data;

    const updatedSettings = await prisma.portfolioSettings.upsert({
      where: { userId },
      update: dataToUpdate,
      create: {
        userId,
        template: dataToUpdate.template || "MODERN",
        themeMode: dataToUpdate.themeMode || DEFAULT_CUSTOMIZATION.themeMode,
        themeColor: dataToUpdate.themeColor || DEFAULT_CUSTOMIZATION.themeColor,
        fontFamily: dataToUpdate.fontFamily || DEFAULT_CUSTOMIZATION.fontFamily,
        showAbout: dataToUpdate.showAbout ?? DEFAULT_CUSTOMIZATION.showAbout,
        showSkills: dataToUpdate.showSkills ?? DEFAULT_CUSTOMIZATION.showSkills,
        showProjects: dataToUpdate.showProjects ?? DEFAULT_CUSTOMIZATION.showProjects,
        showExperience: dataToUpdate.showExperience ?? DEFAULT_CUSTOMIZATION.showExperience,
        showEducation: dataToUpdate.showEducation ?? DEFAULT_CUSTOMIZATION.showEducation,
        showContact: dataToUpdate.showContact ?? DEFAULT_CUSTOMIZATION.showContact,
        showSocialLinks: dataToUpdate.showSocialLinks ?? DEFAULT_CUSTOMIZATION.showSocialLinks,
        buttonStyle: dataToUpdate.buttonStyle || DEFAULT_CUSTOMIZATION.buttonStyle,
        borderRadius: dataToUpdate.borderRadius || DEFAULT_CUSTOMIZATION.borderRadius,
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true },
    });

    revalidatePortfolioCache({ userId, username: user?.username });

    return NextResponse.json({
      message: "Portfolio customization saved successfully.",
      settings: updatedSettings,
    });
  } catch (error) {
    console.error("PATCH /api/portfolio/settings error:", error);
    return NextResponse.json(
      { error: "Failed to update portfolio customization." },
      { status: 500 }
    );
  }
}
