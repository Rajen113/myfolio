import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPortfolioAnalytics } from "@/lib/analytics/aggregate";
import { getPrimaryPortfolioUrl } from "@/lib/utils/portfolio-url";
import AnalyticsClient from "./AnalyticsClient";

export const metadata = {
  title: "Portfolio Analytics — MyFolio",
  description: "Track visitors, views, top referrers, and device metrics for your public portfolio.",
};

export default async function AnalyticsPage() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      username: true,
      portfolioSettings: {
        select: { isPublished: true },
      },
      customDomains: {
        where: { status: { in: ["VERIFIED", "ACTIVE"] } },
        select: { domain: true, status: true, isPrimary: true },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const primaryUrl = getPrimaryPortfolioUrl({
    username: user.username,
    customDomains: user.customDomains,
  });

  const isPublished = Boolean(user.portfolioSettings?.isPublished);

  // Fetch initial 30-day analytics data
  const initialData = await getPortfolioAnalytics(userId, 30);

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AnalyticsClient
        initialData={initialData}
        primaryUrl={primaryUrl}
        isPublished={isPublished}
      />
    </div>
  );
}
