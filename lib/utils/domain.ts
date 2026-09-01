import { getRootDomain } from "./subdomain";

/**
 * Safely normalize user-submitted domain string.
 * e.g. "  https://www.RajenMandal.com/foo?bar  " -> "www.rajenmandal.com"
 */
export function normalizeDomain(input: string): string {
  if (!input) return "";

  let cleaned = input.trim().toLowerCase();

  // Strip protocol
  cleaned = cleaned.replace(/^https?:\/\//i, "");

  // Strip path, port, query strings, and hash
  cleaned = cleaned.split("/")[0];
  cleaned = cleaned.split("?")[0];
  cleaned = cleaned.split("#")[0];
  cleaned = cleaned.split(":")[0];

  // Strip trailing dot if present
  cleaned = cleaned.replace(/\.$/, "");

  return cleaned.trim();
}

/**
 * Validate custom domain input and protect MyFolio internal domains.
 */
export function validateDomain(input: string): { valid: boolean; error?: string; normalizedDomain?: string } {
  if (!input || input.trim() === "") {
    return { valid: false, error: "Domain name is required." };
  }

  const domain = normalizeDomain(input);

  if (domain.length < 3 || domain.length > 253) {
    return { valid: false, error: "Domain must be between 3 and 253 characters." };
  }

  // Reject IP addresses (v4 & v6)
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(domain) || domain.includes(":")) {
    return { valid: false, error: "IP addresses cannot be used as custom domains." };
  }

  // Reject localhost
  if (domain === "localhost" || domain.endsWith(".localhost")) {
    return { valid: false, error: "Localhost cannot be connected as a public custom domain." };
  }

  // Standard domain format check
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;
  if (!domainRegex.test(domain)) {
    return { valid: false, error: "Please enter a valid domain name (e.g. example.com or www.example.com)." };
  }

  // Protect MyFolio root domain and any MyFolio subdomains
  const rootDomain = getRootDomain().toLowerCase().trim();
  if (
    domain === rootDomain ||
    domain === `www.${rootDomain}` ||
    domain.endsWith(`.${rootDomain}`)
  ) {
    return {
      valid: false,
      error: `You cannot connect ${domain} because it is a reserved MyFolio system domain.`,
    };
  }

  return { valid: true, normalizedDomain: domain };
}
