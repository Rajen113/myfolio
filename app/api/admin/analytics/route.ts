import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalPortfolios,
      publishedPortfolios,
      totalViews,
      viewsToday,
      views7Days,
      views30Days,
      activeDomains,
      unreadMessages,
      deviceStats,
      referrerStats,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.portfolioSettings.count(),
      prisma.portfolioSettings.count({ where: { isPublished: true } }),
      prisma.portfolioViewEvent.count(),
      prisma.portfolioViewEvent.count({ where: { viewedAt: { gte: startOfToday } } }),
      prisma.portfolioViewEvent.count({ where: { viewedAt: { gte: sevenDaysAgo } } }),
      prisma.portfolioViewEvent.count({ where: { viewedAt: { gte: thirtyDaysAgo } } }),
      prisma.customDomain.count({ where: { status: "ACTIVE" } }),
      prisma.contactMessage.count({ where: { status: "UNREAD" } }),
      prisma.portfolioViewEvent.groupBy({
        by: ["deviceType"],
        _count: { deviceType: true },
        where: { viewedAt: { gte: thirtyDaysAgo } },
      }),
      prisma.portfolioViewEvent.groupBy({
        by: ["referrerDomain"],
        _count: { referrerDomain: true },
        where: { viewedAt: { gte: thirtyDaysAgo } },
        orderBy: { _count: { referrerDomain: "desc" } },
        take: 10,
      }),
    ]);

    return NextResponse.json({
      analytics: {
        totalUsers,
        totalPortfolios,
        publishedPortfolios,
        totalViews,
        viewsToday,
        views7Days,
        views30Days,
        activeDomains,
        unreadMessages,
        deviceStats,
        referrerStats,
      },
    });
  } catch (error) {
    const err = error as Error;
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
