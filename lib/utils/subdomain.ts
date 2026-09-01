import { isReservedSubdomain } from "@/lib/constants/reserved-subdomains";

/**
 * Get configured root domain from environment or default to myfolio.com
 */
export function getRootDomain(): string {
  const envDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
  if (envDomain) {
    return envDomain.toLowerCase().trim();
  }
  return "myfolio.com";
}

/**
 * Safely extract and validate subdomain from request hostname.
 * Returns lowercase username if valid subdomain, or null if root domain / invalid.
 */
export function extractSubdomain(hostname: string | null | undefined): string | null {
  if (!hostname) return null;

  // Normalize host: strip port if present, lowercase and trim
  const hostWithoutPort = hostname.split(":")[0].toLowerCase().trim();
  const rootDomain = getRootDomain().split(":")[0].toLowerCase().trim();

  // Handle local development hostnames (e.g. rajen.localhost or rajen.localhost:3000)
  if (hostWithoutPort.endsWith(".localhost") || hostWithoutPort === "localhost") {
    if (hostWithoutPort === "localhost") return null;

    const parts = hostWithoutPort.split(".");
    if (parts.length === 2) {
      const sub = parts[0];
      if (sub === "www" || isReservedSubdomain(sub)) return null;
      return sub;
    }
    return null;
  }

  // Exact root domain match (e.g. myfolio.com or www.myfolio.com)
  if (hostWithoutPort === rootDomain || hostWithoutPort === `www.${rootDomain}`) {
    return null;
  }

  // Check if hostname strictly ends with `.rootDomain`
  if (!hostWithoutPort.endsWith(`.${rootDomain}`)) {
    return null;
  }

  // Extract subdomain part before `.${rootDomain}`
  const subdomainPart = hostWithoutPort.slice(0, -(rootDomain.length + 1));

  // If there are multiple subdomain dots (e.g. foo.bar.myfolio.com), ignore or take direct subdomain
  const parts = subdomainPart.split(".");
  if (parts.length !== 1) {
    return null;
  }

  const subdomain = parts[0];

  // Ignore 'www' and reserved subdomains
  if (subdomain === "www" || isReservedSubdomain(subdomain)) {
    return null;
  }

  // Ensure subdomain matches valid username characters (a-z, 0-9, hyphen)
  if (!/^[a-z0-9-]+$/.test(subdomain) || subdomain.startsWith("-") || subdomain.endsWith("-")) {
    return null;
  }

  return subdomain;
}
