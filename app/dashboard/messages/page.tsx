import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MessagesClient, { ContactMessageDTO } from "./MessagesClient";

export const metadata = {
  title: "Messages — MyFolio Dashboard",
  description: "View and manage direct visitor inquiries sent to your MyFolio portfolio.",
};

export default async function MessagesPage() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Fetch all non-archived messages + count unread
  const [messages, unreadCount] = await Promise.all([
    prisma.contactMessage.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.contactMessage.count({
      where: {
        userId,
        status: "UNREAD",
      },
    }),
  ]);

  const initialMessages: ContactMessageDTO[] = messages.map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    subject: m.subject,
    message: m.message,
    status: m.status as "UNREAD" | "READ" | "ARCHIVED",
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <MessagesClient
        initialMessages={initialMessages}
        initialUnreadCount={unreadCount}
      />
    </div>
  );
}
