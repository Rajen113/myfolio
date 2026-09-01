import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/validations/auth";
import { isReservedUsername } from "@/lib/constants/reserved-usernames";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validationResult = signupSchema.safeParse(body);

    if (!validationResult.success) {
      const issue = validationResult.error.issues[0];
      return NextResponse.json(
        { error: issue ? issue.message : "Invalid input data" },
        { status: 400 }
      );
    }

    const { name, email, username, password } = validationResult.data;
    const normalizedEmail = email.toLowerCase();
    const normalizedUsername = username ? username.toLowerCase().trim() : null;

    // Check existing email
    const existingEmail = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    // Check existing username if provided
    if (normalizedUsername) {
      if (isReservedUsername(normalizedUsername)) {
        return NextResponse.json(
          { error: "This username is reserved by the system" },
          { status: 400 }
        );
      }

      const existingUsername = await prisma.user.findUnique({
        where: { username: normalizedUsername },
      });

      if (existingUsername) {
        return NextResponse.json(
          { error: "Username is already taken" },
          { status: 400 }
        );
      }
    }

    // Securely hash password
    const hashedPassword = await hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        username: normalizedUsername,
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "An error occurred during account creation. Please try again." },
      { status: 500 }
    );
  }
}
