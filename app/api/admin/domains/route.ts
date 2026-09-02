import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";
import { CustomDomainStatus, Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const search = searchParams.get("search")?.trim() || "";
    const statusParam = searchParams.get("status");

    const skip = (page - 1) * limit;

    const where: Prisma.CustomDomainWhereInput = {};

    if (search) {
      where.OR = [
        { domain: { contains: search, mode: "insensitive" } },
        { user: { username: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (statusParam && Object.values(CustomDomainStatus).includes(statusParam as CustomDomainStatus)) {
      where.status = statusParam as CustomDomainStatus;
    }

    const [domains, total] = await Promise.all([
      prisma.customDomain.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          domain: true,
          status: true,
          isPrimary: true,
          verifiedAt: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
            },
          },
        },
      }),
      prisma.customDomain.count({ where }),
    ]);

    return NextResponse.json({
      domains,
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
