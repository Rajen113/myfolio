import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/admin/audit-logger";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user: adminUser } = await requireAdmin();
    const { id: portfolioId } = await params;

    const portfolio = await prisma.portfolioSettings.findUnique({
      where: { id: portfolioId },
      include: { user: { select: { email: true, username: true } } },
    });

    if (!portfolio) {
      return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
    }

    const updatedPortfolio = await prisma.portfolioSettings.update({
      where: { id: portfolioId },
      data: {
        isPublished: false,
      },
    });

    await logAdminAction({
      adminUserId: adminUser.id,
      action: "PORTFOLIO_UNPUBLISHED",
      targetType: "PORTFOLIO",
      targetId: portfolioId,
      metadata: {
        ownerUsername: portfolio.user.username,
        ownerEmail: portfolio.user.email,
      },
    });

    return NextResponse.json({ portfolio: updatedPortfolio });
  } catch (error) {
    const err = error as Error;
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
