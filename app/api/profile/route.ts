import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { profileSchema } from "@/lib/validations/profile";
import { revalidatePortfolioCache } from "@/lib/portfolio/cache";

// GET /api/profile — Retrieve authenticated user's profile
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

    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, username: true },
    });

    return NextResponse.json({
      profile,
      user,
    });
  } catch (error) {
    console.error("GET /api/profile error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// POST /api/profile & PATCH /api/profile — Save or Update authenticated user's profile
export async function POST(req: Request) {
  return handleSaveProfile(req);
}

export async function PATCH(req: Request) {
  return handleSaveProfile(req);
}

async function handleSaveProfile(req: Request) {
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

    const validationResult = profileSchema.safeParse(body);

    if (!validationResult.success) {
      const issue = validationResult.error.issues[0];
      return NextResponse.json(
        { error: issue ? issue.message : "Invalid profile data" },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Create or Update profile using Prisma upsert (derived strictly from session.user.id)
    const profile = await prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        fullName: data.fullName,
        headline: data.headline || null,
        bio: data.bio || null,
        location: data.location || null,
        website: data.website || null,
        github: data.github || null,
        linkedin: data.linkedin || null,
        email: data.email || null,
        phone: data.phone || null,
        showEmail: data.showEmail,
        showPhone: data.showPhone,
      },
      update: {
        fullName: data.fullName,
        headline: data.headline || null,
        bio: data.bio || null,
        location: data.location || null,
        website: data.website || null,
        github: data.github || null,
        linkedin: data.linkedin || null,
        email: data.email || null,
        phone: data.phone || null,
        showEmail: data.showEmail,
        showPhone: data.showPhone,
      },
    });

    // Sync full name to User record as well
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name: data.fullName },
      select: { username: true },
    });

    // Revalidate public portfolio cache
    revalidatePortfolioCache({ userId, username: updatedUser.username });

    return NextResponse.json({
      success: true,
      message: "Profile saved successfully",
      profile,
    });
  } catch (error) {
    console.error("Save profile error:", error);
    return NextResponse.json(
      { error: "Failed to save profile. Please try again." },
      { status: 500 }
    );
  }
}
