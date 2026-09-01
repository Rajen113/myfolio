import { getRootDomain } from "./subdomain";

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
