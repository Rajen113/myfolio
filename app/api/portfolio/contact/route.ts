import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { findUserForPortfolio } from "@/lib/utils/portfolio-lookup";
import { contactSubmissionSchema } from "@/lib/validations/contact";
import { isContactRateLimited } from "@/lib/contact/rate-limit";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    // 1. Zod Validation
    const parseResult = contactSubmissionSchema.safeParse(body);
    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || "Validation failed";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { username, name, email, subject, message, website } = parseResult.data;

    // 2. Honeypot check: Bots filling out hidden "website" input get trapped silently
    if (website && website.trim().length > 0) {
      return NextResponse.json({
        success: true,
        message: "Message sent successfully!",
      });
    }

    // 3. Rate limiting check
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "unknown-ip";

    if (isContactRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many contact requests. Please wait a few minutes before trying again." },
        { status: 429 }
      );
    }

    // 4. Server resolves target portfolio & owner (never trusts client userId/portfolioId)
    const user = await findUserForPortfolio(username);

    if (
      !user ||
      !user.portfolioSettings ||
      !user.portfolioSettings.isPublished
    ) {
      return NextResponse.json(
        { error: "Portfolio not found or is currently not accepting public messages." },
        { status: 404 }
      );
    }

    // 5. Create ContactMessage entry
    await prisma.contactMessage.create({
      data: {
        userId: user.id,
        portfolioId: user.portfolioSettings.id,
        name,
        email,
        subject,
        message,
        status: "UNREAD",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Message sent successfully!",
    });
  } catch (error) {
    console.error("POST /api/portfolio/contact error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while sending your message." },
      { status: 500 }
    );
  }
}
