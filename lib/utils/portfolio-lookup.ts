import { prisma } from "@/lib/prisma";

/**
 * Helper to lookup user and portfolio settings by either username or verified custom domain
 */
export async function findUserForPortfolio(param: string) {
  if (!param) return null;
  const cleanParam = decodeURIComponent(param).toLowerCase().trim();

  // 1. Try finding user directly by unique username
  const userByUsername = await prisma.user.findUnique({
    where: { username: cleanParam },
    select: {
      id: true,
      name: true,
      username: true,
      customDomains: {
        where: { status: { in: ["VERIFIED", "ACTIVE"] } },
        select: { domain: true, status: true, isPrimary: true },
      },
      portfolioSettings: true,
    },
  });

  if (userByUsername) {
    return userByUsername;
  }

  // 2. Try finding user by verified/active custom domain
  const domainRecord = await prisma.customDomain.findFirst({
    where: {
      domain: cleanParam,
      status: { in: ["VERIFIED", "ACTIVE"] },
    },
    select: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          customDomains: {
            where: { status: { in: ["VERIFIED", "ACTIVE"] } },
            select: { domain: true, status: true, isPrimary: true },
          },
          portfolioSettings: true,
        },
      },
    },
  });

  return domainRecord?.user || null;
}
