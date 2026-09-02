// Rate-limiting cache for contact form submissions: IP -> list of timestamps
const contactRateLimitMap = new Map<string, number[]>();

/**
 * Checks if the IP has exceeded 5 contact form submissions in 10 minutes.
 */
export function isContactRateLimited(ip: string | null | undefined): boolean {
  if (!ip) return false;

  const now = Date.now();
  const windowMs = 10 * 60 * 1000; // 10 minutes
  const maxSubmissions = 5;

  const timestamps = contactRateLimitMap.get(ip) || [];

  // Filter out timestamps outside window
  const validTimestamps = timestamps.filter((ts) => now - ts < windowMs);

  if (validTimestamps.length >= maxSubmissions) {
    return true; // Rate limited
  }

  validTimestamps.push(now);
  contactRateLimitMap.set(ip, validTimestamps);

  // Periodic cleanup if map grows
  if (contactRateLimitMap.size > 2000) {
    for (const [key, tsList] of contactRateLimitMap.entries()) {
      const active = tsList.filter((ts) => now - ts < windowMs);
      if (active.length === 0) {
        contactRateLimitMap.delete(key);
      } else {
        contactRateLimitMap.set(key, active);
      }
    }
  }

  return false;
}
