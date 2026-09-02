import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getPrimaryPortfolioUrl } from "@/lib/utils/portfolio-url";
import { getRootDomain } from "@/lib/utils/subdomain";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rootDomain = getRootDomain();
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const baseUrl = `${protocol}://${rootDomain}`;

  let publishedUsers: Array<{
    username: string | null;
    updatedAt: Date;
    portfolioSettings: {
      publishedAt: Date | null;
      updatedAt: Date;
    } | null;
    customDomains: Array<{
      domain: string;
      status: string;
      isPrimary: boolean;
    }>;
  }> = [];

  try {
    // Query published user portfolios
    publishedUsers = await prisma.user.findMany({
      where: {
        username: { not: null },
        portfolioSettings: {
          isPublished: true,
        },
      },
      select: {
        username: true,
        updatedAt: true,
        portfolioSettings: {
          select: {
            publishedAt: true,
            updatedAt: true,
          },
        },
        customDomains: {
          where: { status: { in: ["VERIFIED", "ACTIVE"] } },
          select: { domain: true, status: true, isPrimary: true },
        },
      },
    });
  } catch (error) {
    console.warn("⚠️ Database unreachable during sitemap generation; falling back to base sitemap:", (error as Error).message);
  }

  const portfolioEntries: MetadataRoute.Sitemap = publishedUsers
    .map((user) => {
      const primaryUrl = getPrimaryPortfolioUrl({
        username: user.username,
        customDomains: user.customDomains,
      });

      if (!primaryUrl) return null;

      const lastMod =
        user.portfolioSettings?.updatedAt ||
        user.portfolioSettings?.publishedAt ||
        user.updatedAt;

      return {
        url: primaryUrl,
        lastModified: lastMod,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    ...portfolioEntries,
  ];
}
