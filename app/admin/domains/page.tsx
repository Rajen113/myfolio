import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";
import DomainsTable from "@/components/admin/DomainsTable";
import { CustomDomainStatus, Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminDomainsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;

  const page = Math.max(1, parseInt(params.page || "1", 10));
  const limit = 10;
  const search = params.search?.trim() || "";
  const statusParam = params.status;

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

  const totalPages = Math.ceil(total / limit);

  const formattedDomains = domains.map((d) => ({
    ...d,
    verifiedAt: d.verifiedAt ? d.verifiedAt.toISOString() : null,
    createdAt: d.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Custom Domain Management
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Monitor custom domains linked to user portfolios across the system.
        </p>
      </div>

      <DomainsTable
        domains={formattedDomains}
        total={total}
        page={page}
        totalPages={totalPages}
      />
    </div>
  );
}
