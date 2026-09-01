export const RESERVED_SUBDOMAINS = [
  "www",
  "app",
  "api",
  "admin",
  "dashboard",
  "auth",
  "login",
  "signup",
  "settings",
  "support",
  "help",
  "docs",
  "blog",
  "status",
  "mail",
  "email",
  "cdn",
  "static",
  "assets",
  "dev",
  "staging",
  "test",
  "profile",
  "username",
  "about",
  "contact",
  "terms",
  "privacy",
  "favicon",
  "robots",
  "sitemap",
  "index",
  "home",
  "myfolio",
] as const;

export function isReservedSubdomain(subdomain: string): boolean {
  if (!subdomain) return true;
  const normalized = subdomain.toLowerCase().trim();
  return RESERVED_SUBDOMAINS.includes(normalized as typeof RESERVED_SUBDOMAINS[number]);
}
