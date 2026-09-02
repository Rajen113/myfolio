import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { skillSchema } from "@/lib/validations/skill";
import { revalidatePortfolioCache } from "@/lib/portfolio/cache";

// GET /api/skills — Retrieve authenticated user's skills
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

    const skills = await prisma.skill.findMany({
      where: { userId },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ skills });
  } catch (error) {
    console.error("GET /api/skills error:", error);
    return NextResponse.json(
      { error: "Failed to fetch skills" },
      { status: 500 }
    );
  }
}

// POST /api/skills — Create a new skill for authenticated user
export async function POST(req: Request) {
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

    const validationResult = skillSchema.safeParse(body);

    if (!validationResult.success) {
      const issue = validationResult.error.issues[0];
      return NextResponse.json(
        { error: issue ? issue.message : "Invalid skill data" },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Check case-insensitive duplicate skill for the same user
    const existingSkills = await prisma.skill.findMany({
      where: { userId },
      select: { id: true, name: true },
    });

    const isDuplicate = existingSkills.some(
      (s) => s.name.toLowerCase() === data.name.toLowerCase()
    );

    if (isDuplicate) {
      return NextResponse.json(
        { error: `You have already added "${data.name}" to your skills.` },
        { status: 400 }
      );
    }

    // Get max displayOrder to append to end
    const lastSkill = await prisma.skill.findFirst({
      where: { userId },
      orderBy: { displayOrder: "desc" },
      select: { displayOrder: true },
    });

    const nextDisplayOrder = lastSkill ? lastSkill.displayOrder + 1 : 0;

    const skill = await prisma.skill.create({
      data: {
        userId,
        name: data.name,
        category: data.category || null,
        proficiency: data.proficiency,
        displayOrder: data.displayOrder ?? nextDisplayOrder,
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true },
    });
    revalidatePortfolioCache({ userId, username: user?.username });

    return NextResponse.json(
      { success: true, message: "Skill added successfully", skill },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/skills error:", error);
    return NextResponse.json(
      { error: "Failed to create skill" },
      { status: 500 }
    );
  }
}
