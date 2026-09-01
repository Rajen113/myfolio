import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { usernameSchema } from "@/lib/validations/auth";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawUsername = searchParams.get("username") || "";
    const username = rawUsername.toLowerCase().trim();

    if (!username) {
      return NextResponse.json(
        { available: false, username: "", message: "Username parameter is required" },
        { status: 400 }
      );
    }

    // Validate format & reserved words
    const validationResult = usernameSchema.safeParse(username);
    if (!validationResult.success) {
      const issue = validationResult.error.issues[0];
      return NextResponse.json(
        {
          available: false,
          username,
          message: issue ? issue.message : "Invalid username format",
        },
        { status: 200 }
      );
    }

    // Check optional current authenticated user session
    const session = await auth();
    const currentUserId = session?.user?.id;

    // Query database for existing username owner
    const existingUser = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (existingUser) {
      if (currentUserId && existingUser.id === currentUserId) {
        return NextResponse.json({
          available: true,
          username,
          isCurrent: true,
          message: "This is your current username",
        });
      }

      return NextResponse.json({
        available: false,
        username,
        message: "✕ This username is already taken",
      });
    }

    return NextResponse.json({
      available: true,
      username,
      message: "✓ Username available",
    });
  } catch (error) {
    console.error("Username check error:", error);
    return NextResponse.json(
      { available: false, message: "Error checking username availability" },
      { status: 500 }
    );
  }
}
