import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";
import PortfoliosTable from "@/components/admin/PortfoliosTable";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminPortfoliosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; published?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;

  const page = Math.max(1, parseInt(params.page || "1", 10));
  const limit = 10;
  const search = params.search?.trim() || "";
  const publishedParam = params.published;

  const skip = (page - 1) * limit;

  const where: Prisma.PortfolioSettingsWhereInput = {};

  if (search) {
    where.user = {
      OR: [
        { username: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    };
  }

  if (publishedParam === "true") {
    where.isPublished = true;
  } else if (publishedParam === "false") {
    where.isPublished = false;
  }

  const [portfolios, total] = await Promise.all([
    prisma.portfolioSettings.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        template: true,
        isPublished: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
          },
        },
        _count: {
          select: {
            viewEvents: true,
            contactMessages: true,
          },
        },
      },
    }),
    prisma.portfolioSettings.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  const formattedPortfolios = portfolios.map((p) => ({
    ...p,
    publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Portfolio Management
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Inspect, filter, and manage user portfolios published across the platform.
        </p>
      </div>

      <PortfoliosTable
        portfolios={formattedPortfolios}
        total={total}
        page={page}
        totalPages={totalPages}
      />
    </div>
  );
}
