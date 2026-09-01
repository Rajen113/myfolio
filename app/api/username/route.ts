import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateUsernameSchema } from "@/lib/validations/auth";
import { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to update your username." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validationResult = updateUsernameSchema.safeParse(body);

    if (!validationResult.success) {
      const issue = validationResult.error.issues[0];
      return NextResponse.json(
        { error: issue ? issue.message : "Invalid username format" },
        { status: 400 }
      );
    }

    const normalizedUsername = validationResult.data.username.toLowerCase().trim();

    // Check if another user owns this username
    const existingUser = await prisma.user.findFirst({
      where: {
        username: normalizedUsername,
        NOT: { id: session.user.id },
      },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "✕ This username is already taken" },
        { status: 400 }
      );
    }

    // Save to database
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { username: normalizedUsername },
      select: {
        id: true,
        email: true,
        username: true,
      },
    });

    return NextResponse.json({
      success: true,
      username: updatedUser.username,
      message: "Username updated successfully",
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "✕ This username is already taken" },
          { status: 400 }
        );
      }
      if (error.code === "P2025") {
        return NextResponse.json(
          { error: "User session invalid or user no longer exists. Please log in again." },
          { status: 401 }
        );
      }
    }

    console.error("Update username error:", error);
    return NextResponse.json(
      { error: "Failed to update username. Please try again." },
      { status: 500 }
    );
  }
}
