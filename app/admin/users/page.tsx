import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";
import UsersTable from "@/components/admin/UsersTable";
import { UserRole, UserStatus, Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; role?: string; status?: string }>;
}) {
  const { user: currentAdmin } = await requireAdmin();
  const params = await searchParams;

  const page = Math.max(1, parseInt(params.page || "1", 10));
  const limit = 10;
  const search = params.search?.trim() || "";
  const roleParam = params.role;
  const statusParam = params.status;

  const skip = (page - 1) * limit;

  const where: Prisma.UserWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { username: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  if (roleParam && Object.values(UserRole).includes(roleParam as UserRole)) {
    where.role = roleParam as UserRole;
  }

  if (statusParam && Object.values(UserStatus).includes(statusParam as UserStatus)) {
    where.status = statusParam as UserStatus;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        status: true,
        createdAt: true,
        portfolioSettings: {
          select: {
            isPublished: true,
            template: true,
          },
        },
        _count: {
          select: {
            projects: true,
            skills: true,
            customDomains: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  // Convert Date objects to strings for Client Component serialization
  const formattedUsers = users.map((u) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          User Management
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          View, search, and manage registered user accounts across the platform.
        </p>
      </div>

      <UsersTable
        users={formattedUsers}
        total={total}
        page={page}
        totalPages={totalPages}
        currentAdminId={currentAdmin.id}
      />
    </div>
  );
}
