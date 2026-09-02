import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ContactMessageStatus } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);

    const statusParam = searchParams.get("status") || "ALL"; // ALL, UNREAD, READ, ARCHIVED
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    // Filter condition based on status
    const whereCondition: { userId: string; status?: ContactMessageStatus } = {
      userId,
    };

    if (statusParam === "UNREAD" || statusParam === "READ" || statusParam === "ARCHIVED") {
      whereCondition.status = statusParam as ContactMessageStatus;
    } else if (statusParam === "ALL") {
      // By default "ALL" inbox excludes ARCHIVED unless explicitly requested
      whereCondition.status = { not: "ARCHIVED" } as unknown as ContactMessageStatus;
    }

    // Parallel count queries & paginated fetch
    const [messages, totalCount, unreadCount] = await Promise.all([
      prisma.contactMessage.findMany({
        where: whereCondition,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.contactMessage.count({
        where: whereCondition,
      }),
      prisma.contactMessage.count({
        where: {
          userId,
          status: "UNREAD",
        },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit) || 1;

    return NextResponse.json({
      messages,
      total: totalCount,
      unreadCount,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    console.error("GET /api/messages error:", error);
    return NextResponse.json(
      { error: "Failed to fetch contact messages" },
      { status: 500 }
    );
  }
}
