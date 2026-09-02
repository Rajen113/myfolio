/**
 * Lightweight server-side User-Agent device classification.
 */
export function getDeviceType(userAgent: string | null | undefined): "desktop" | "mobile" | "tablet" | "unknown" {
  if (!userAgent) return "unknown";

  const ua = userAgent.toLowerCase();

  if (/(ipad|tablet|playbook|silk)|(android(?!.*mobile))/i.test(ua)) {
    return "tablet";
  }

  if (
    /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(
      ua
    )
  ) {
    return "mobile";
  }

  if (/mozilla|chrome|safari|firefox|edge|opera|msie|trident/i.test(ua)) {
    return "desktop";
  }

  return "unknown";
}
