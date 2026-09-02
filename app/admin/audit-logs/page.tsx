import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";
import AuditLogsTable from "@/components/admin/AuditLogsTable";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminAuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; action?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;

  const page = Math.max(1, parseInt(params.page || "1", 10));
  const limit = 10;
  const action = params.action?.trim();

  const skip = (page - 1) * limit;

  const where: Prisma.AdminAuditLogWhereInput = {};

  if (action) {
    where.action = action;
  }

  const [logs, total] = await Promise.all([
    prisma.adminAuditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        action: true,
        targetType: true,
        targetId: true,
        metadata: true,
        createdAt: true,
        adminUser: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
          },
        },
      },
    }),
    prisma.adminAuditLog.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  const formattedLogs = logs.map((l) => ({
    ...l,
    createdAt: l.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Admin Audit Logs
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Append-only audit trail of administrative actions performed across the platform.
        </p>
      </div>

      <AuditLogsTable
        logs={formattedLogs}
        total={total}
        page={page}
        totalPages={totalPages}
      />
    </div>
  );
}
