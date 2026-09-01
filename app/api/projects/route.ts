import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { projectSchema } from "@/lib/validations/project";

// GET /api/projects — Retrieve authenticated user's projects
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

    const projects = await prisma.project.findMany({
      where: { userId },
      orderBy: [
        { featured: "desc" },
        { displayOrder: "asc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("GET /api/projects error:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// POST /api/projects — Create a new project for authenticated user
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

    const validationResult = projectSchema.safeParse(body);

    if (!validationResult.success) {
      const issue = validationResult.error.issues[0];
      return NextResponse.json(
        { error: issue ? issue.message : "Invalid project data" },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Get max displayOrder to append at the end
    const lastProject = await prisma.project.findFirst({
      where: { userId },
      orderBy: { displayOrder: "desc" },
      select: { displayOrder: true },
    });

    const nextDisplayOrder = lastProject ? lastProject.displayOrder + 1 : 0;

    const project = await prisma.project.create({
      data: {
        userId,
        title: data.title,
        description: data.description,
        image: data.image || null,
        liveUrl: data.liveUrl || null,
        githubUrl: data.githubUrl || null,
        technologies: data.technologies,
        featured: data.featured ?? false,
        displayOrder: data.displayOrder ?? nextDisplayOrder,
      },
    });

    return NextResponse.json(
      { success: true, message: "Project created successfully", project },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/projects error:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
