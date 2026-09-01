import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { experienceSchema } from "@/lib/validations/experience";
import { EmploymentType } from "@prisma/client";

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const experiences = await prisma.experience.findMany({
      where: { userId: session.user.id },
      orderBy: [
        { current: "desc" },
        { displayOrder: "asc" },
        { startDate: "desc" },
      ],
    });

    return NextResponse.json({ experiences });
  } catch (error) {
    console.error("GET /api/experience error:", error);
    return NextResponse.json(
      { error: "Failed to fetch experience records." },
      { status: 500 }
    );
  }
}

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

    const validation = experienceSchema.safeParse(body);

    if (!validation.success) {
      const firstIssue = validation.error.issues[0];
      return NextResponse.json(
        { error: firstIssue ? firstIssue.message : "Invalid input data." },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Determine default display order (max + 1)
    const highestOrderItem = await prisma.experience.findFirst({
      where: { userId },
      orderBy: { displayOrder: "desc" },
      select: { displayOrder: true },
    });

    const displayOrder = (highestOrderItem?.displayOrder ?? -1) + 1;

    const experience = await prisma.experience.create({
      data: {
        userId,
        company: data.company,
        position: data.position,
        employmentType: data.employmentType as EmploymentType,
        location: data.location,
        startDate: new Date(data.startDate),
        endDate: data.current || !data.endDate ? null : new Date(data.endDate),
        current: data.current,
        description: data.description,
        displayOrder,
      },
    });

    return NextResponse.json(
      { message: "Experience record created successfully.", experience },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/experience error:", error);
    return NextResponse.json(
      { error: "Failed to create experience record." },
      { status: 500 }
    );
  }
}
