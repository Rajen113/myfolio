import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateResumeSettingsSchema = z.object({
  template: z.enum(["PROFESSIONAL", "MODERN", "MINIMAL"]).optional(),
  showSummary: z.boolean().optional(),
  showSkills: z.boolean().optional(),
  showExperience: z.boolean().optional(),
  showEducation: z.boolean().optional(),
  showProjects: z.boolean().optional(),
  showSocialLinks: z.boolean().optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await prisma.resumeSettings.findUnique({
      where: { userId: session.user.id },
    });

    if (!settings) {
      // Create default
      const defaultSettings = await prisma.resumeSettings.create({
        data: {
          userId: session.user.id,
          template: "PROFESSIONAL",
        },
      });
      return NextResponse.json(defaultSettings);
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("GET /api/resume/settings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch resume settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parseResult = updateResumeSettingsSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const updated = await prisma.resumeSettings.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        ...parseResult.data,
      },
      update: parseResult.data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/resume/settings error:", error);
    return NextResponse.json(
      { error: "Failed to update resume settings" },
      { status: 500 }
    );
  }
}
