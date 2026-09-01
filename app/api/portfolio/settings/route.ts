import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { portfolioSettingsSchema } from "@/lib/validations/portfolio-settings";

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

    const { template } = validation.data;

    const updatedSettings = await prisma.portfolioSettings.upsert({
      where: { userId },
      update: { template },
      create: {
        userId,
        template,
      },
    });

    return NextResponse.json({
      message: "Portfolio template updated successfully.",
      settings: updatedSettings,
      template: updatedSettings.template,
    });
  } catch (error) {
    console.error("PATCH /api/portfolio/settings error:", error);
    return NextResponse.json(
      { error: "Failed to update portfolio template." },
      { status: 500 }
    );
  }
}
