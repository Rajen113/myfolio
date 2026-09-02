import { isBot } from "../lib/analytics/bot";
import { getDeviceType } from "../lib/analytics/device";
import { normalizeReferrer } from "../lib/analytics/referrer";
import { generateVisitorHash } from "../lib/analytics/visitor";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Test failed: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ Test passed: ${message}`);
  }
}

console.log("=== Running Analytics Unit & Integration Tests ===");

// 1. Test Bot Detection
assert(isBot("Googlebot/2.1 (+http://www.google.com/bot.html)") === true, "Googlebot identified as bot");
assert(isBot("Mozilla/5.0 (compatible; bingbot/2.0)") === true, "Bingbot identified as bot");
assert(isBot("Twitterbot/1.0") === true, "Twitterbot identified as bot");
assert(isBot("LinkedInBot/1.0") === true, "LinkedInBot identified as bot");
assert(
  isBot("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36") === false,
  "Real Chrome browser not identified as bot"
);

// 2. Test Device Classification
assert(
  getDeviceType("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148") === "mobile",
  "iPhone classified as mobile"
);
assert(
  getDeviceType("Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1") === "tablet",
  "iPad classified as tablet"
);
assert(
  getDeviceType("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36") === "desktop",
  "Windows Chrome classified as desktop"
);
assert(getDeviceType(null) === "unknown", "Null User-Agent classified as unknown");

// 3. Test Referrer Normalization
assert(
  normalizeReferrer("https://www.linkedin.com/feed/", "rajen.myfolio.com") === "linkedin.com",
  "Normalizes LinkedIn feed URL to linkedin.com"
);
assert(
  normalizeReferrer("https://google.com/search?q=myfolio", "rajen.myfolio.com") === "google.com",
  "Normalizes Google search URL to google.com"
);
assert(
  normalizeReferrer("https://rajen.myfolio.com/projects", "rajen.myfolio.com") === "Direct",
  "Internal host referrer returns Direct"
);
assert(normalizeReferrer("", "myfolio.com") === "Direct", "Empty referrer returns Direct");
assert(normalizeReferrer(null, null) === "Direct", "Null referrer returns Direct");

// 4. Test Privacy-Preserving Visitor Hash Generator
const hash1 = generateVisitorHash("192.168.1.1", "Mozilla/5.0 Chrome/120", "2026-09-02");
const hash2 = generateVisitorHash("192.168.1.1", "Mozilla/5.0 Chrome/120", "2026-09-02");
const hashDifferentDate = generateVisitorHash("192.168.1.1", "Mozilla/5.0 Chrome/120", "2026-09-03");
const hashDifferentIp = generateVisitorHash("10.0.0.1", "Mozilla/5.0 Chrome/120", "2026-09-02");

assert(hash1 === hash2, "Identical IP and User-Agent on same day produce identical visitorHash");
assert(hash1 !== hashDifferentDate, "Different date produces different visitorHash (daily privacy rotation)");
assert(hash1 !== hashDifferentIp, "Different IP produces different visitorHash");
assert(!hash1.includes("192.168.1.1"), "visitorHash does not leak raw IP address");

console.log("All Analytics Unit Tests Passed Successfully! 🎉");
