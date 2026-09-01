export const RESERVED_USERNAMES: readonly string[] = [
  "admin",
  "api",
  "login",
  "signup",
  "dashboard",
  "settings",
  "profile",
  "username",
  "about",
  "contact",
  "help",
  "support",
  "terms",
  "privacy",
  "favicon",
  "robots",
  "sitemap",
  "index",
  "home",
  "auth",
  "myfolio",
];

export function isReservedUsername(username: string): boolean {
  if (!username) return false;
  const normalized = username.toLowerCase().trim();
  return RESERVED_USERNAMES.includes(normalized);
}
