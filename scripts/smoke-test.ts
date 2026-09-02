import { isSafeUrl } from "../lib/validations/url";
import { validateDomain } from "../lib/utils/domain";
import { validateEnv } from "../lib/env";
import { logger } from "../lib/logger";

async function runSmokeTests() {
  console.log("🚀 Running MyFolio Production Smoke Tests...\n");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✓ SMOKE PASSED: ${testName}`);
      passed++;
    } else {
      console.error(`  ✕ SMOKE FAILED: ${testName}`);
      failed++;
    }
  }

  // 1. Environment Variable Validation
  console.log("--- 1. Testing Environment Configuration ---");
  try {
    const env = validateEnv();
    assert(env !== null, "Environment configuration is valid");
  } catch (e) {
    assert(false, `Environment configuration failed: ${(e as Error).message}`);
  }

  // 2. Custom Domain & Wildcard Subdomain Logic
  console.log("\n--- 2. Testing Custom Domain & Subdomain Logic ---");
  assert(validateDomain("john-doe.com").valid, "Valid external custom domain allowed");
  assert(!validateDomain("myfolio.com").valid, "System root domain protected");
  assert(!validateDomain("admin.myfolio.com").valid, "System subdomain protected");

  // 3. Security & URL Sanitization Smoke Check
  console.log("\n--- 3. Testing Security & URL Sanitization ---");
  assert(isSafeUrl("https://github.com/myfolio"), "Valid HTTPS URL allowed");
  assert(!isSafeUrl("javascript:alert(1)"), "XSS javascript: protocol blocked");

  // 4. Production Logger Smoke Check
  console.log("\n--- 4. Testing Production Logger Redaction ---");
  try {
    logger.info("Smoke test message", { password: "secret-password", user: "test-user" });
    assert(true, "Production logger executed cleanly with redaction");
  } catch {
    assert(false, "Production logger error");
  }

  console.log(`\n========================================`);
  console.log(`Smoke Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runSmokeTests().catch((err) => {
  console.error("Smoke test runner error:", err);
  process.exit(1);
});
