import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ContactMessageStatus } from "@prisma/client";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: messageId } = await params;
    const body = await req.json().catch(() => ({}));
    const newStatus = body.status as ContactMessageStatus;

    if (!["UNREAD", "READ", "ARCHIVED"].includes(newStatus)) {
      return NextResponse.json(
        { error: "Invalid status. Must be UNREAD, READ, or ARCHIVED." },
        { status: 400 }
      );
    }

    // Verify ownership
    const existingMessage = await prisma.contactMessage.findUnique({
      where: { id: messageId },
      select: { id: true, userId: true },
    });

    if (!existingMessage || existingMessage.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Message not found or forbidden." },
        { status: 404 }
      );
    }

    const updatedMessage = await prisma.contactMessage.update({
      where: { id: messageId },
      data: { status: newStatus },
    });

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error("PATCH /api/messages/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update message status" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: messageId } = await params;

    // Verify ownership
    const existingMessage = await prisma.contactMessage.findUnique({
      where: { id: messageId },
      select: { id: true, userId: true },
    });

    if (!existingMessage || existingMessage.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Message not found or forbidden." },
        { status: 404 }
      );
    }

    await prisma.contactMessage.delete({
      where: { id: messageId },
    });

    return NextResponse.json({ success: true, message: "Message deleted" });
  } catch (error) {
    console.error("DELETE /api/messages/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 }
    );
  }
}
