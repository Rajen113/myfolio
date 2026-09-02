import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { skillSchema } from "@/lib/validations/skill";
import { revalidatePortfolioCache } from "@/lib/portfolio/cache";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/skills/[id] — Get single skill by ID for authenticated owner
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const userId = session.user.id;

    const skill = await prisma.skill.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!skill) {
      return NextResponse.json(
        { error: "Skill not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ skill });
  } catch (error) {
    console.error("GET /api/skills/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch skill" },
      { status: 500 }
    );
  }
}

// PATCH /api/skills/[id] — Update skill by ID for authenticated owner
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const userId = session.user.id;

    // Check ownership
    const existingSkill = await prisma.skill.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingSkill) {
      return NextResponse.json(
        { error: "Skill not found" },
        { status: 404 }
      );
    }

    const body = await req.json();

    const validationResult = skillSchema.partial().safeParse(body);

    if (!validationResult.success) {
      const issue = validationResult.error.issues[0];
      return NextResponse.json(
        { error: issue ? issue.message : "Invalid skill update data" },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // If name is updated, check case-insensitive duplicate skill for same user
    if (data.name && data.name.toLowerCase() !== existingSkill.name.toLowerCase()) {
      const otherSkills = await prisma.skill.findMany({
        where: {
          userId,
          NOT: { id },
        },
        select: { name: true },
      });

      const isDuplicate = otherSkills.some(
        (s) => s.name.toLowerCase() === data.name!.toLowerCase()
      );

      if (isDuplicate) {
        return NextResponse.json(
          { error: `You already have a skill named "${data.name}".` },
          { status: 400 }
        );
      }
    }

    const updatedSkill = await prisma.skill.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.category !== undefined && { category: data.category || null }),
        ...(data.proficiency !== undefined && { proficiency: data.proficiency }),
        ...(data.displayOrder !== undefined && { displayOrder: data.displayOrder }),
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true },
    });
    revalidatePortfolioCache({ userId, username: user?.username });

    return NextResponse.json({
      success: true,
      message: "Skill updated successfully",
      skill: updatedSkill,
    });
  } catch (error) {
    console.error("PATCH /api/skills/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update skill" },
      { status: 500 }
    );
  }
}

// DELETE /api/skills/[id] — Delete skill by ID for authenticated owner
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const userId = session.user.id;

    // Check ownership
    const existingSkill = await prisma.skill.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingSkill) {
      return NextResponse.json(
        { error: "Skill not found" },
        { status: 404 }
      );
    }

    await prisma.skill.delete({
      where: { id },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true },
    });
    revalidatePortfolioCache({ userId, username: user?.username });

    return NextResponse.json({
      success: true,
      message: "Skill deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/skills/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete skill" },
      { status: 500 }
    );
  }
}
