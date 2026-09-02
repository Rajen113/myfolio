import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/admin/audit-logger";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user: adminUser } = await requireAdmin();
    const { id: messageId } = await params;

    const message = await prisma.contactMessage.findUnique({
      where: { id: messageId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    if (!message) {
      return NextResponse.json({ error: "Contact message not found" }, { status: 404 });
    }

    // Log admin message inspection
    await logAdminAction({
      adminUserId: adminUser.id,
      action: "MESSAGE_VIEWED",
      targetType: "CONTACT_MESSAGE",
      targetId: messageId,
      metadata: {
        senderEmail: message.email,
        recipientUsername: message.user.username,
        subject: message.subject,
      },
    });

    return NextResponse.json({ message });
  } catch (error) {
    const err = error as Error;
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
