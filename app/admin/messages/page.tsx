import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";
import MessagesTable from "@/components/admin/MessagesTable";
import { ContactMessageStatus, Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage({
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

  const where: Prisma.ContactMessageWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { subject: { contains: search, mode: "insensitive" } },
      { user: { username: { contains: search, mode: "insensitive" } } },
    ];
  }

  if (statusParam && Object.values(ContactMessageStatus).includes(statusParam as ContactMessageStatus)) {
    where.status = statusParam as ContactMessageStatus;
  }

  const [messages, total] = await Promise.all([
    prisma.contactMessage.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        subject: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    }),
    prisma.contactMessage.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  const formattedMessages = messages.map((m) => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Contact Messages Moderation
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Platform-level overview of support inquiries and contact form submissions.
        </p>
      </div>

      <MessagesTable
        messages={formattedMessages}
        total={total}
        page={page}
        totalPages={totalPages}
      />
    </div>
  );
}
