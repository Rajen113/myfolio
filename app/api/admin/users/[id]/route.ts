import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        profile: true,
        portfolioSettings: {
          select: {
            id: true,
            template: true,
            isPublished: true,
            publishedAt: true,
            updatedAt: true,
          },
        },
        customDomains: {
          select: {
            id: true,
            domain: true,
            status: true,
            isPrimary: true,
            verifiedAt: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            projects: true,
            skills: true,
            experience: true,
            education: true,
            customDomains: true,
            contactMessages: true,
            portfolioViewEvents: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    const err = error as Error;
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
