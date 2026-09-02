import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json().catch(() => ({}));

    const rawSeoTitle = body.seoTitle;
    const rawSeoDescription = body.seoDescription;

    // Sanitize and validate seoTitle
    let seoTitle: string | null = null;
    if (typeof rawSeoTitle === "string" && rawSeoTitle.trim().length > 0) {
      const cleanedTitle = rawSeoTitle.replace(/<[^>]*>?/gm, "").trim();
      if (cleanedTitle.length > 70) {
        return NextResponse.json(
          { error: "SEO Title must not exceed 70 characters." },
          { status: 400 }
        );
      }
      seoTitle = cleanedTitle;
    }

    // Sanitize and validate seoDescription
    let seoDescription: string | null = null;
    if (typeof rawSeoDescription === "string" && rawSeoDescription.trim().length > 0) {
      const cleanedDesc = rawSeoDescription.replace(/<[^>]*>?/gm, "").trim();
      if (cleanedDesc.length > 200) {
        return NextResponse.json(
          { error: "SEO Description must not exceed 200 characters." },
          { status: 400 }
        );
      }
      seoDescription = cleanedDesc;
    }

    const updatedSettings = await prisma.portfolioSettings.upsert({
      where: { userId },
      update: {
        seoTitle,
        seoDescription,
      },
      create: {
        userId,
        seoTitle,
        seoDescription,
      },
    });

    return NextResponse.json({
      success: true,
      seoTitle: updatedSettings.seoTitle,
      seoDescription: updatedSettings.seoDescription,
      message: "✓ SEO settings updated successfully!",
    });
  } catch (error) {
    console.error("PATCH /api/portfolio/seo error:", error);
    return NextResponse.json({ error: "Failed to update SEO settings" }, { status: 500 });
  }
}
