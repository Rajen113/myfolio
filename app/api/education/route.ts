import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { educationSchema } from "@/lib/validations/education";

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const education = await prisma.education.findMany({
      where: { userId: session.user.id },
      orderBy: [
        { current: "desc" },
        { displayOrder: "asc" },
        { startDate: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ education });
  } catch (error) {
    console.error("GET /api/education error:", error);
    return NextResponse.json(
      { error: "Failed to fetch education records." },
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

    const validation = educationSchema.safeParse(body);

    if (!validation.success) {
      const firstIssue = validation.error.issues[0];
      return NextResponse.json(
        { error: firstIssue ? firstIssue.message : "Invalid input data." },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Calculate next display order
    const highestOrderItem = await prisma.education.findFirst({
      where: { userId },
      orderBy: { displayOrder: "desc" },
      select: { displayOrder: true },
    });

    const displayOrder = (highestOrderItem?.displayOrder ?? -1) + 1;

    const newEducation = await prisma.education.create({
      data: {
        userId,
        institution: data.institution,
        degree: data.degree,
        fieldOfStudy: data.fieldOfStudy || null,
        customDegree: data.degree === "OTHER" ? data.customDegree || null : null,
        customFieldOfStudy: data.fieldOfStudy === "OTHER" ? data.customFieldOfStudy || null : null,
        location: data.location,
        startDate: new Date(data.startDate),
        endDate: data.current || !data.endDate ? null : new Date(data.endDate),
        current: data.current,
        grade: data.grade,
        description: data.description,
        displayOrder,
      },
    });

    return NextResponse.json(
      { message: "Education record created successfully.", education: newEducation },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/education error:", error);
    return NextResponse.json(
      { error: "Failed to create education record." },
      { status: 500 }
    );
  }
}
