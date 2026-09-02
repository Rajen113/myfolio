import { isSafeUrl } from "../lib/validations/url";
import { checkRateLimit } from "../lib/rate-limit";
import { validateDomain } from "../lib/utils/domain";
import { usernameSchema } from "../lib/validations/auth";

async function runSecurityTests() {
  console.log("🔒 Running MyFolio Security Suite...\n");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✓ PASSED: ${testName}`);
      passed++;
    } else {
      console.error(`  ✕ FAILED: ${testName}`);
      failed++;
    }
  }

  // 1. URL Safety & XSS Protocol Prevention Tests
  console.log("--- 1. Testing URL Safety & Protocol Sanitization ---");
  assert(!isSafeUrl("javascript:alert('XSS')"), "Rejects javascript: scheme");
  assert(!isSafeUrl("data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=="), "Rejects data: scheme");
  assert(!isSafeUrl("vbscript:msgbox(1)"), "Rejects vbscript: scheme");
  assert(!isSafeUrl("file:///etc/passwd"), "Rejects file: scheme");
  assert(!isSafeUrl("//malicious.com/payload"), "Rejects protocol-relative // URLs");
  assert(isSafeUrl("https://github.com/myfolio"), "Accepts valid HTTPS URL");
  assert(isSafeUrl("http://localhost:3000/avatar.png"), "Accepts valid HTTP URL");
  assert(isSafeUrl("/avatar.png"), "Accepts safe relative path");

  // 2. Domain Security & Reservation Tests
  console.log("\n--- 2. Testing Custom Domain Security ---");
  assert(!validateDomain("myfolio.com").valid, "Rejects root system domain (myfolio.com)");
  assert(!validateDomain("app.myfolio.com").valid, "Rejects app subdomain (app.myfolio.com)");
  assert(!validateDomain("api.myfolio.com").valid, "Rejects api subdomain (api.myfolio.com)");
  assert(!validateDomain("127.0.0.1").valid, "Rejects IPv4 address");
  assert(!validateDomain("localhost").valid, "Rejects localhost");
  assert(validateDomain("rajenmandal.com").valid, "Accepts valid external custom domain");
  assert(validateDomain("www.rajenmandal.com").valid, "Accepts valid www external custom domain");

  // 3. Username Validation & System Reservation Tests
  console.log("\n--- 3. Testing Username Security & Reserved Names ---");
  assert(!usernameSchema.safeParse("admin").success, "Rejects reserved username 'admin'");
  assert(!usernameSchema.safeParse("api").success, "Rejects reserved username 'api'");
  assert(!usernameSchema.safeParse("dashboard").success, "Rejects reserved username 'dashboard'");
  assert(!usernameSchema.safeParse("-invalid").success, "Rejects username starting with hyphen");
  assert(!usernameSchema.safeParse("invalid-").success, "Rejects username ending with hyphen");
  assert(!usernameSchema.safeParse("ab").success, "Rejects username under 3 characters");
  assert(usernameSchema.safeParse("rajen-dev").success, "Accepts valid username 'rajen-dev'");

  // 4. Rate Limiter Tests
  console.log("\n--- 4. Testing In-Memory Rate Limiter ---");
  const testKey = "test-rate-limit-ip-123";
  const limit1 = checkRateLimit({ key: testKey, limit: 2, windowMs: 10000 });
  const limit2 = checkRateLimit({ key: testKey, limit: 2, windowMs: 10000 });
  const limit3 = checkRateLimit({ key: testKey, limit: 2, windowMs: 10000 });

  assert(limit1.success && limit1.remaining === 1, "First request allowed under limit");
  assert(limit2.success && limit2.remaining === 0, "Second request allowed under limit");
  assert(!limit3.success && limit3.remaining === 0, "Third request blocked over limit");

  console.log(`\n========================================`);
  console.log(`Security Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityTests().catch((err) => {
  console.error("Test runner error:", err);
  process.exit(1);
});
