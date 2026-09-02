import crypto from "crypto";

const ANALYTICS_SECRET = process.env.AUTH_SECRET || "myfolio-analytics-daily-privacy-salt";

/**
 * Generates a privacy-preserving daily visitor hash.
 * Combines IP address, User-Agent, current UTC date, and secret salt into a 16-character SHA-256 slice.
 * Never exposes or stores the raw IP address or browser fingerprints.
 */
export function generateVisitorHash(
  ip: string | null | undefined,
  userAgent: string | null | undefined,
  dateStr?: string
): string {
  const cleanIp = ip ? ip.trim() : "unknown-ip";
  const cleanUa = userAgent ? userAgent.trim() : "unknown-ua";
  const dateKey = dateStr || new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const rawInput = `${cleanIp}:${cleanUa}:${dateKey}:${ANALYTICS_SECRET}`;
  return crypto.createHash("sha256").update(rawInput).digest("hex").slice(0, 16);
}
