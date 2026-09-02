import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const search = searchParams.get("search")?.trim() || "";
    const publishedParam = searchParams.get("published");

    const skip = (page - 1) * limit;

    const where: Prisma.PortfolioSettingsWhereInput = {};

    if (search) {
      where.user = {
        OR: [
          { username: { contains: search, mode: "insensitive" } },
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    if (publishedParam === "true") {
      where.isPublished = true;
    } else if (publishedParam === "false") {
      where.isPublished = false;
    }

    const [portfolios, total] = await Promise.all([
      prisma.portfolioSettings.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          template: true,
          isPublished: true,
          publishedAt: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
            },
          },
          _count: {
            select: {
              viewEvents: true,
              contactMessages: true,
            },
          },
        },
      }),
      prisma.portfolioSettings.count({ where }),
    ]);

    return NextResponse.json({
      portfolios,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
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
