import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";
import { CustomDomainStatus } from "@prisma/client";
import { logAdminAction } from "@/lib/admin/audit-logger";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user: adminUser } = await requireAdmin();
    const { id: domainId } = await params;
    const body = await req.json();

    const { status: newStatus } = body;

    if (!newStatus || !Object.values(CustomDomainStatus).includes(newStatus as CustomDomainStatus)) {
      return NextResponse.json(
        { error: "Invalid status. Must be PENDING, VERIFIED, ACTIVE, or FAILED." },
        { status: 400 }
      );
    }

    const domainRecord = await prisma.customDomain.findUnique({
      where: { id: domainId },
      include: { user: { select: { email: true, username: true } } },
    });

    if (!domainRecord) {
      return NextResponse.json({ error: "Custom domain not found" }, { status: 404 });
    }

    const updatedDomain = await prisma.customDomain.update({
      where: { id: domainId },
      data: { status: newStatus as CustomDomainStatus },
    });

    await logAdminAction({
      adminUserId: adminUser.id,
      action: newStatus === "FAILED" ? "DOMAIN_DEACTIVATED" : "DOMAIN_STATUS_UPDATED",
      targetType: "DOMAIN",
      targetId: domainId,
      metadata: {
        domainName: domainRecord.domain,
        ownerEmail: domainRecord.user.email,
        previousStatus: domainRecord.status,
        newStatus: updatedDomain.status,
      },
    });

    return NextResponse.json({ domain: updatedDomain });
  } catch (error) {
    const err = error as Error;
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user: adminUser } = await requireAdmin();
    const { id: domainId } = await params;

    const domainRecord = await prisma.customDomain.findUnique({
      where: { id: domainId },
      include: { user: { select: { email: true, username: true } } },
    });

    if (!domainRecord) {
      return NextResponse.json({ error: "Custom domain not found" }, { status: 404 });
    }

    await prisma.customDomain.delete({
      where: { id: domainId },
    });

    await logAdminAction({
      adminUserId: adminUser.id,
      action: "DOMAIN_DELETED",
      targetType: "DOMAIN",
      targetId: domainId,
      metadata: {
        domainName: domainRecord.domain,
        ownerEmail: domainRecord.user.email,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const err = error as Error;
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
