import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { experienceSchema } from "@/lib/validations/experience";
import { EmploymentType } from "@prisma/client";
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

    const experience = await prisma.experience.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!experience) {
      return NextResponse.json(
        { error: "Experience record not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ experience });
  } catch (error) {
    console.error("GET /api/experience/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch experience details." },
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

    const existingExperience = await prisma.experience.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingExperience) {
      return NextResponse.json(
        { error: "Experience record not found." },
        { status: 404 }
      );
    }

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

    const updatedExperience = await prisma.experience.update({
      where: { id },
      data: {
        company: data.company,
        position: data.position,
        employmentType: data.employmentType as EmploymentType,
        location: data.location,
        startDate: new Date(data.startDate),
        endDate: data.current || !data.endDate ? null : new Date(data.endDate),
        current: data.current,
        description: data.description,
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { username: true },
    });
    revalidatePortfolioCache({ userId: session.user.id, username: user?.username });

    return NextResponse.json({
      message: "Experience record updated successfully.",
      experience: updatedExperience,
    });
  } catch (error) {
    console.error("PATCH /api/experience/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update experience record." },
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

    const existingExperience = await prisma.experience.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingExperience) {
      return NextResponse.json(
        { error: "Experience record not found." },
        { status: 404 }
      );
    }

    await prisma.experience.delete({
      where: { id },
    });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { username: true },
    });
    revalidatePortfolioCache({ userId: session.user.id, username: user?.username });

    return NextResponse.json({
      message: "Experience record deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE /api/experience/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete experience record." },
      { status: 500 }
    );
  }
}
