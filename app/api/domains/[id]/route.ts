import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePortfolioCache } from "@/lib/portfolio/cache";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = session.user.id;

    // Find custom domain ensuring user ownership
    const customDomain = await prisma.customDomain.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!customDomain) {
      return NextResponse.json({ error: "Custom domain not found" }, { status: 404 });
    }

    await prisma.customDomain.delete({
      where: { id: customDomain.id },
    });

    // If deleted domain was primary, set another domain as primary if available
    if (customDomain.isPrimary) {
      const remainingDomain = await prisma.customDomain.findFirst({
        where: { userId },
        orderBy: { createdAt: "asc" },
      });

      if (remainingDomain) {
        await prisma.customDomain.update({
          where: { id: remainingDomain.id },
          data: { isPrimary: true },
        });
      }
    }

    revalidatePortfolioCache({ userId, domain: customDomain.domain });

    return NextResponse.json({
      success: true,
      message: "Custom domain removed successfully",
    });
  } catch (error) {
    console.error("DELETE /api/domains/[id] error:", error);
    return NextResponse.json({ error: "Failed to remove custom domain" }, { status: 500 });
  }
}
