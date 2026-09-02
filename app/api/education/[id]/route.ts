import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { educationSchema } from "@/lib/validations/education";
import { revalidatePortfolioCache } from "@/lib/portfolio/cache";

interface RouteParams {
  params: Promise<{ id: string }>;
}

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

    const education = await prisma.education.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!education) {
      return NextResponse.json(
        { error: "Education record not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ education });
  } catch (error) {
    console.error("GET /api/education/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch education details." },
      { status: 500 }
    );
  }
}

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

    const existingEducation = await prisma.education.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingEducation) {
      return NextResponse.json(
        { error: "Education record not found." },
        { status: 404 }
      );
    }

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

    const updatedEducation = await prisma.education.update({
      where: { id },
      data: {
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
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { username: true },
    });
    revalidatePortfolioCache({ userId: session.user.id, username: user?.username });

    return NextResponse.json({
      message: "Education record updated successfully.",
      education: updatedEducation,
    });
  } catch (error) {
    console.error("PATCH /api/education/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update education record." },
      { status: 500 }
    );
  }
}

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

    const existingEducation = await prisma.education.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingEducation) {
      return NextResponse.json(
        { error: "Education record not found." },
        { status: 404 }
      );
    }

    await prisma.education.delete({
      where: { id },
    });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { username: true },
    });
    revalidatePortfolioCache({ userId: session.user.id, username: user?.username });

    return NextResponse.json({
      message: "Education record deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE /api/education/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete education record." },
      { status: 500 }
    );
  }
}
