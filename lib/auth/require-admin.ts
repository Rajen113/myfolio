import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole, UserStatus } from "@prisma/client";

export interface AdminAuthResult {
  user: {
    id: string;
    email: string;
    name: string | null;
    username: string | null;
    role: UserRole;
    status: UserStatus;
  };
}

/**
 * Server-side helper to authenticate and authorize an administrator.
 * Always fetches current role and status directly from the database.
 * Throws errors with predictable codes for unauthorized/forbidden access.
 */
export async function requireAdmin(): Promise<AdminAuthResult> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      role: true,
      status: true,
    },
  });

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  if (user.status === UserStatus.SUSPENDED) {
    throw new Error("USER_SUSPENDED");
  }

  if (user.role !== UserRole.ADMIN) {
    throw new Error("FORBIDDEN");
  }

  return { user };
}
