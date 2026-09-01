import { prisma } from "@/lib/prisma";
import { extractSubdomain } from "./subdomain";
import { normalizeDomain } from "./domain";

export interface ResolvedUser {
  userId: string;
  username: string;
  isPublished: boolean;
  isCustomDomain: boolean;
  resolvedHost: string;
}

/**
 * Resolve an incoming hostname to a user and portfolio username.
 * Supports custom domains (rajenmandal.com) and MyFolio subdomains (rajen.myfolio.com).
 */
export async function resolveDomainToUser(hostname: string): Promise<ResolvedUser | null> {
  if (!hostname) return null;

  const normalizedHost = normalizeDomain(hostname);
  if (!normalizedHost) return null;

  // 1. Check if hostname is a Custom Domain registered in database
  // Try exact match or without www. prefix
  const domainCandidates = [normalizedHost];
  if (normalizedHost.startsWith("www.")) {
    domainCandidates.push(normalizedHost.replace(/^www\./, ""));
  }

  const customDomainRecord = await prisma.customDomain.findFirst({
    where: {
      domain: { in: domainCandidates },
      status: { in: ["VERIFIED", "ACTIVE"] },
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          portfolioSettings: {
            select: { isPublished: true },
          },
        },
      },
    },
  });

  if (customDomainRecord && customDomainRecord.user && customDomainRecord.user.username) {
    return {
      userId: customDomainRecord.user.id,
      username: customDomainRecord.user.username,
      isPublished: customDomainRecord.user.portfolioSettings?.isPublished ?? false,
      isCustomDomain: true,
      resolvedHost: customDomainRecord.domain,
    };
  }

  // 2. Check if hostname is a MyFolio subdomain (e.g. rajen.myfolio.com)
  const subdomain = extractSubdomain(hostname);
  if (subdomain) {
    const user = await prisma.user.findUnique({
      where: { username: subdomain },
      select: {
        id: true,
        username: true,
        portfolioSettings: {
          select: { isPublished: true },
        },
      },
    });

    if (user && user.username) {
      return {
        userId: user.id,
        username: user.username,
        isPublished: user.portfolioSettings?.isPublished ?? false,
        isCustomDomain: false,
        resolvedHost: `${user.username}.myfolio.com`,
      };
    }
  }

  return null;
}
