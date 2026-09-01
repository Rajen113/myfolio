import { getRootDomain } from "./subdomain";

export interface UserWithCustomDomains {
  username?: string | null;
  customDomains?: Array<{
    domain: string;
    status: string;
    isPrimary?: boolean;
  }>;
}

/**
 * Generate primary public portfolio URL following priority:
 * 1. Primary Active Custom Domain (https://rajenmandal.com)
 * 2. Verified Custom Domain (https://rajenmandal.com)
 * 3. Subdomain (https://rajen.myfolio.com)
 * 4. Path fallback (https://myfolio.com/rajen)
 */
export function getPrimaryPortfolioUrl(user: UserWithCustomDomains): string {
  if (!user || !user.username) return "";

  const username = user.username;

  // Check if user has active/verified custom domains
  if (user.customDomains && user.customDomains.length > 0) {
    // 1. Look for primary verified/active custom domain
    const primaryDomain = user.customDomains.find(
      (d) => (d.status === "VERIFIED" || d.status === "ACTIVE") && d.isPrimary
    );
    if (primaryDomain) {
      return `https://${primaryDomain.domain}`;
    }

    // 2. Look for any verified/active custom domain
    const verifiedDomain = user.customDomains.find(
      (d) => d.status === "VERIFIED" || d.status === "ACTIVE"
    );
    if (verifiedDomain) {
      return `https://${verifiedDomain.domain}`;
    }
  }

  // 3. Fallback to Subdomain URL
  return getPortfolioUrl(username);
}

/**
 * Generate full dynamic public URL for a user's portfolio subdomain.
 * Supports client-side browser port detection and server-side SSR fallbacks.
 */
export function getPortfolioUrl(username: string): string {
  if (!username) return "";
  const cleanUsername = username.toLowerCase().trim();

  // In browser context
  if (typeof window !== "undefined") {
    const host = window.location.host;
    const protocol = window.location.protocol;

    if (host.includes("localhost")) {
      const port = window.location.port ? `:${window.location.port}` : ":3000";
      return `${protocol}//${cleanUsername}.localhost${port}`;
    }

    const rootDomain = getRootDomain();
    return `${protocol}//${cleanUsername}.${rootDomain}`;
  }

  // Server-side default logic
  const rootDomain = getRootDomain();
  if (process.env.NODE_ENV === "development" || rootDomain.includes("localhost")) {
    const port = process.env.NEXT_PUBLIC_APP_PORT || "3000";
    return `http://${cleanUsername}.localhost:${port}`;
  }

  const protocol = process.env.NEXT_PUBLIC_SITE_PROTOCOL || "https:";
  return `${protocol}//${cleanUsername}.${rootDomain}`;
}

/**
 * Generate secondary path URL (e.g. /rajen)
 */
export function getPortfolioPath(username: string): string {
  if (!username) return "/";
  return `/${username.toLowerCase().trim()}`;
}
