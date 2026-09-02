/**
 * Normalizes HTTP Referer header into clean domain format (e.g. linkedin.com, google.com).
 * Returns "Direct" if missing or internal origin.
 */
export function normalizeReferrer(
  referrer: string | null | undefined,
  host: string | null | undefined
): string {
  if (!referrer || referrer.trim() === "") return "Direct";

  try {
    const url = new URL(referrer);
    let hostname = url.hostname.toLowerCase();

    // Strip www.
    if (hostname.startsWith("www.")) {
      hostname = hostname.slice(4);
    }

    // Ignore internal referrers matching current domain or localhost
    if (host) {
      const cleanHost = host.toLowerCase().replace(/^www\./, "");
      if (hostname === cleanHost || hostname.endsWith(`.${cleanHost}`)) {
        return "Direct";
      }
    }

    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "Direct";
    }

    return hostname || "Direct";
  } catch {
    return "Direct";
  }
}
