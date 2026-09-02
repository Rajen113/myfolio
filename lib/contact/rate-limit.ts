import { checkRateLimit } from "../rate-limit";

/**
 * Checks if the IP has exceeded 5 contact form submissions in 10 minutes.
 */
export function isContactRateLimited(ip: string | null | undefined): boolean {
  if (!ip) return false;

  const result = checkRateLimit({
    key: `contact:${ip}`,
    limit: 5,
    windowMs: 10 * 60 * 1000, // 10 minutes
  });

  return !result.success;
}
