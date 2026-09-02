import { prisma } from "@/lib/prisma";
import { isBot } from "./bot";
import { getDeviceType } from "./device";
import { normalizeReferrer } from "./referrer";
import { generateVisitorHash } from "./visitor";

interface RecordViewOptions {
  userId: string;
  portfolioId: string;
  isPublished: boolean;
  userAgent?: string | null;
  referer?: string | null;
  host?: string | null;
  ip?: string | null;
  countryCode?: string | null;
}

// In-memory short-lived cache for rate-limiting rapid refreshes (e.g. within 10 seconds)
const recentViewCache = new Map<string, number>();

/**
 * Clean up entries older than 60s to prevent memory growth
 */
function cleanupRecentViewCache() {
  const now = Date.now();
  if (recentViewCache.size > 5000) {
    for (const [key, timestamp] of recentViewCache.entries()) {
      if (now - timestamp > 60000) {
        recentViewCache.delete(key);
      }
    }
  }
}

/**
 * Asynchronously records a portfolio view event in PostgreSQL.
 * Guarantees privacy, bot filtering, rate limiting, and published portfolio checks.
 */
export async function recordPortfolioView(options: RecordViewOptions): Promise<boolean> {
  try {
    const {
      userId,
      portfolioId,
      isPublished,
      userAgent,
      referer,
      host,
      ip,
      countryCode,
    } = options;

    // 1. Only track published portfolios
    if (!isPublished || !userId || !portfolioId) {
      return false;
    }

    // 2. Filter out known bots/crawlers
    if (isBot(userAgent)) {
      return false;
    }

    // 3. Generate privacy-preserving daily visitor hash
    const visitorHash = generateVisitorHash(ip, userAgent);

    // 4. Rate-limit rapid refreshes from same visitor within 10 seconds
    const cacheKey = `${portfolioId}:${visitorHash}`;
    const now = Date.now();
    const lastViewTime = recentViewCache.get(cacheKey);

    if (lastViewTime && now - lastViewTime < 10000) {
      return false; // Skip duplicate rapid view
    }

    recentViewCache.set(cacheKey, now);
    cleanupRecentViewCache();

    // 5. Extract metadata
    const referrerDomain = normalizeReferrer(referer, host);
    const deviceType = getDeviceType(userAgent);
    const cleanCountry = countryCode && countryCode.trim().length === 2 ? countryCode.trim().toUpperCase() : null;

    // 6. Record event in database
    await prisma.portfolioViewEvent.create({
      data: {
        userId,
        portfolioId,
        referrerDomain,
        deviceType,
        countryCode: cleanCountry,
        visitorHash,
      },
    });

    return true;
  } catch (error) {
    // Non-blocking log to ensure portfolio rendering never crashes
    console.error("recordPortfolioView error:", error);
    return false;
  }
}
