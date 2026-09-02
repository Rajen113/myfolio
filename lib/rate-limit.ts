/**
 * Lightweight, high-performance sliding-window in-memory rate limiter.
 * Prevents endpoint abuse and API spam without third-party Redis overhead.
 */
interface RateLimitTracker {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, RateLimitTracker>();

// Cleanup expired entries periodically to prevent memory growth
if (typeof setInterval !== "undefined") {
  const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, tracker] of memoryStore.entries()) {
      if (tracker.resetAt <= now) {
        memoryStore.delete(key);
      }
    }
  }, CLEANUP_INTERVAL_MS);
  if (timer.unref) timer.unref();
}

export interface RateLimitOptions {
  key: string;       // Unique rate limit key (e.g. `contact:${ip}`)
  limit: number;     // Maximum allowed requests in window
  windowMs: number;  // Window duration in milliseconds
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
}

export function checkRateLimit({
  key,
  limit,
  windowMs,
}: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const tracker = memoryStore.get(key);

  if (!tracker || tracker.resetAt <= now) {
    memoryStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      success: true,
      limit,
      remaining: limit - 1,
      resetMs: windowMs,
    };
  }

  if (tracker.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      resetMs: Math.max(0, tracker.resetAt - now),
    };
  }

  tracker.count += 1;
  return {
    success: true,
    limit,
    remaining: limit - tracker.count,
    resetMs: Math.max(0, tracker.resetAt - now),
  };
}
