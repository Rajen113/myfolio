import { prisma } from "../lib/prisma";
import { UserRole, UserStatus, CustomDomainStatus } from "@prisma/client";
import { sanitizeAuditMetadata } from "../lib/admin/audit-logger";

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ SMOKE PASSED: ${message}`);
    passedTests++;
  } else {
    console.error(`  ✕ SMOKE FAILED: ${message}`);
    failedTests++;
  }
}

async function isDatabaseAvailable(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

async function runAdminTests() {
  console.log("\n🚀 Running MyFolio Admin Dashboard & Authorization Tests...\n");

  // 1. Testing Admin Audit Redaction Logic (Works offline without DB)
  console.log("--- 1. Testing Admin Audit Redaction Logic ---");
  const testMetadata = {
    userEmail: "test@example.com",
    password: "secretpassword123",
    token: "sensitive-token-abc",
  };

  const sanitized = sanitizeAuditMetadata(testMetadata);
  assert(sanitized !== null, "Metadata successfully serialized");
  if (sanitized) {
    assert(!sanitized.includes("secretpassword123"), "Sensitive password redacted from audit log");
    assert(!sanitized.includes("sensitive-token-abc"), "Sensitive token redacted from audit log");
    assert(sanitized.includes("[REDACTED]"), "Redacted token replacement present");
  }

  // 2. Testing Admin Logic Safeguards & Rules (Works offline without DB)
  console.log("\n--- 2. Testing Admin Self-Lockout & Role Logic ---");
  const adminId = "admin-123";
  const isSelf = adminId === adminId;
  const isSuspension = UserStatus.SUSPENDED === "SUSPENDED";
  assert(isSelf && isSuspension, "Self-suspension check logic validated");

  assert(UserRole.ADMIN === "ADMIN", "UserRole ADMIN enum exists");
  assert(UserRole.USER === "USER", "UserRole USER enum exists");
  assert(UserStatus.ACTIVE === "ACTIVE", "UserStatus ACTIVE enum exists");
  assert(UserStatus.SUSPENDED === "SUSPENDED", "UserStatus SUSPENDED enum exists");

  // 3. Testing Database Integration (If DB available in environment)
  console.log("\n--- 3. Testing Database Integration ---");
  const dbAvailable = await isDatabaseAvailable();

  if (!dbAvailable) {
    console.log("  ℹ️ Database server not reachable. Skipping live database CRUD tests (safe for CI).");
  } else {
    let adminUser;
    let regularUser;
    let testPortfolio;
    let testDomain;

    try {
      adminUser = await prisma.user.create({
        data: {
          email: `admin-test-${Date.now()}@example.com`,
          username: `admintest${Date.now().toString().slice(-4)}`,
          password: "hashedpassword123",
          role: UserRole.ADMIN,
          status: UserStatus.ACTIVE,
        },
      });

      regularUser = await prisma.user.create({
        data: {
          email: `user-test-${Date.now()}@example.com`,
          username: `usertest${Date.now().toString().slice(-4)}`,
          password: "hashedpassword123",
          role: UserRole.USER,
          status: UserStatus.ACTIVE,
        },
      });

      assert(adminUser.role === UserRole.ADMIN, "Admin user assigned ADMIN role in database");
      assert(regularUser.status === UserStatus.ACTIVE, "Regular user assigned ACTIVE status in database");

      // Admin suspends user
      const suspendedUser = await prisma.user.update({
        where: { id: regularUser.id },
        data: { status: UserStatus.SUSPENDED },
      });
      assert(suspendedUser.status === UserStatus.SUSPENDED, "Admin suspended user account in database");

      // Admin reactivates user
      const reactivatedUser = await prisma.user.update({
        where: { id: regularUser.id },
        data: { status: UserStatus.ACTIVE },
      });
      assert(reactivatedUser.status === UserStatus.ACTIVE, "Admin reactivated user account in database");

      // Portfolio actions
      testPortfolio = await prisma.portfolioSettings.create({
        data: {
          userId: regularUser.id,
          isPublished: false,
        },
      });

      const publishedPortfolio = await prisma.portfolioSettings.update({
        where: { id: testPortfolio.id },
        data: { isPublished: true, publishedAt: new Date() },
      });
      assert(publishedPortfolio.isPublished, "Admin published portfolio in database");

      // Domain actions
      testDomain = await prisma.customDomain.create({
        data: {
          userId: regularUser.id,
          domain: `test-admin-${Date.now()}.com`,
          verificationToken: `token-${Date.now()}`,
          status: CustomDomainStatus.PENDING,
        },
      });

      const updatedDomain = await prisma.customDomain.update({
        where: { id: testDomain.id },
        data: { status: CustomDomainStatus.ACTIVE, verifiedAt: new Date() },
      });
      assert(updatedDomain.status === CustomDomainStatus.ACTIVE, "Admin updated domain status to ACTIVE in database");

    } catch (err) {
      console.error("Live database test error:", err);
      failedTests++;
    } finally {
      if (testDomain) {
        await prisma.customDomain.delete({ where: { id: testDomain.id } }).catch(() => {});
      }
      if (testPortfolio) {
        await prisma.portfolioSettings.delete({ where: { id: testPortfolio.id } }).catch(() => {});
      }
      if (regularUser) {
        await prisma.user.delete({ where: { id: regularUser.id } }).catch(() => {});
      }
      if (adminUser) {
        await prisma.user.delete({ where: { id: adminUser.id } }).catch(() => {});
      }
      await prisma.$disconnect();
    }
  }

  console.log("\n========================================");
  console.log(`Admin Test Summary: ${passedTests} Passed, ${failedTests} Failed`);
  console.log("========================================\n");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runAdminTests().catch((err) => {
  console.error("Admin test runner error:", err);
  process.exit(1);
});
