import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";
import { UserStatus, UserRole } from "@prisma/client";
import { logAdminAction } from "@/lib/admin/audit-logger";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user: adminUser } = await requireAdmin();
    const { id: targetUserId } = await params;
    const body = await req.json();

    const { status: newStatus } = body;

    if (!newStatus || !Object.values(UserStatus).includes(newStatus as UserStatus)) {
      return NextResponse.json(
        { error: "Invalid status value. Must be ACTIVE or SUSPENDED." },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Target user not found" }, { status: 404 });
    }

    // Safeguard 1: Admin cannot suspend themselves
    if (targetUserId === adminUser.id && newStatus === UserStatus.SUSPENDED) {
      return NextResponse.json(
        { error: "Administrators cannot suspend their own account." },
        { status: 400 }
      );
    }

    // Safeguard 2: Admin cannot suspend the last active administrator
    if (targetUser.role === UserRole.ADMIN && newStatus === UserStatus.SUSPENDED) {
      const activeAdminCount = await prisma.user.count({
        where: {
          role: UserRole.ADMIN,
          status: UserStatus.ACTIVE,
        },
      });

      if (activeAdminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot suspend the last remaining active administrator." },
          { status: 400 }
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: { status: newStatus as UserStatus },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });

    // Create Audit Log Entry
    const auditAction = newStatus === UserStatus.SUSPENDED ? "USER_SUSPENDED" : "USER_REACTIVATED";
    await logAdminAction({
      adminUserId: adminUser.id,
      action: auditAction,
      targetType: "USER",
      targetId: targetUserId,
      metadata: {
        previousStatus: targetUser.status,
        newStatus: updatedUser.status,
        targetEmail: targetUser.email,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    const err = error as Error;
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
