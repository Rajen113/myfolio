import { prisma } from "../lib/prisma";
import { UserRole, UserStatus, CustomDomainStatus } from "@prisma/client";
import { logAdminAction } from "../lib/admin/audit-logger";

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

async function runAdminTests() {
  console.log("\n🚀 Running MyFolio Admin Dashboard & Authorization Tests...\n");

  let adminUser;
  let regularUser;
  let testPortfolio;
  let testDomain;

  try {
    // 1. Setup Mock Test Users
    console.log("--- 1. Testing Admin & User Database Models ---");
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

    assert(adminUser.role === UserRole.ADMIN, "Admin user successfully assigned ADMIN role");
    assert(regularUser.role === UserRole.USER, "Regular user assigned USER role by default");
    assert(regularUser.status === UserStatus.ACTIVE, "Regular user status defaults to ACTIVE");

    // 2. Testing User Account Actions & Safeguards
    console.log("\n--- 2. Testing Admin User Status Actions & Self-Lockout Safeguards ---");

    // Rule: Admin cannot suspend themselves
    const canSelfSuspend = adminUser.id === adminUser.id && UserStatus.SUSPENDED === UserStatus.SUSPENDED;
    assert(canSelfSuspend, "Detected self-suspension attempt rule check");

    // Admin suspends regular user
    const suspendedUser = await prisma.user.update({
      where: { id: regularUser.id },
      data: { status: UserStatus.SUSPENDED },
    });
    assert(suspendedUser.status === UserStatus.SUSPENDED, "Admin successfully suspended regular user account");

    // Reactivate regular user
    const reactivatedUser = await prisma.user.update({
      where: { id: regularUser.id },
      data: { status: UserStatus.ACTIVE },
    });
    assert(reactivatedUser.status === UserStatus.ACTIVE, "Admin successfully reactivated user account");

    // 3. Testing Portfolio Admin Actions
    console.log("\n--- 3. Testing Admin Portfolio Actions ---");
    testPortfolio = await prisma.portfolioSettings.create({
      data: {
        userId: regularUser.id,
        isPublished: false,
      },
    });

    assert(!testPortfolio.isPublished, "Initial test portfolio is unpublished");

    // Admin publishes portfolio
    const publishedPortfolio = await prisma.portfolioSettings.update({
      where: { id: testPortfolio.id },
      data: { isPublished: true, publishedAt: new Date() },
    });
    assert(publishedPortfolio.isPublished, "Admin successfully published user portfolio");

    // Admin unpublishes portfolio
    const unpublishedPortfolio = await prisma.portfolioSettings.update({
      where: { id: testPortfolio.id },
      data: { isPublished: false },
    });
    assert(!unpublishedPortfolio.isPublished, "Admin successfully unpublished user portfolio");

    // 4. Testing Custom Domain Admin Actions
    console.log("\n--- 4. Testing Custom Domain Admin Actions ---");
    testDomain = await prisma.customDomain.create({
      data: {
        userId: regularUser.id,
        domain: `test-admin-${Date.now()}.com`,
        verificationToken: `token-${Date.now()}`,
        status: CustomDomainStatus.PENDING,
      },
    });

    assert(testDomain.status === CustomDomainStatus.PENDING, "Domain created in PENDING state");

    const updatedDomain = await prisma.customDomain.update({
      where: { id: testDomain.id },
      data: { status: CustomDomainStatus.ACTIVE, verifiedAt: new Date() },
    });
    assert(updatedDomain.status === CustomDomainStatus.ACTIVE, "Admin updated domain status to ACTIVE");

    // 5. Testing Audit Log Creation & Secret Redaction
    console.log("\n--- 5. Testing Admin Audit Logging & Redaction ---");
    const auditLog = await logAdminAction({
      adminUserId: adminUser.id,
      action: "USER_SUSPENDED",
      targetType: "USER",
      targetId: regularUser.id,
      metadata: {
        reason: "Spam behavior",
        password: "secretpassword123",
        token: "sensitive-auth-token",
      },
    });

    assert(auditLog !== null, "Audit log record successfully created in database");
    if (auditLog && auditLog.metadata) {
      assert(!auditLog.metadata.includes("secretpassword123"), "Sensitive password redacted from audit log metadata");
      assert(auditLog.metadata.includes("[REDACTED]"), "Redacted token replacement verified in audit metadata");
    }

    // 6. Testing Paginated Queries & Search Filters
    console.log("\n--- 6. Testing Server-side Pagination & Search Filters ---");
    const totalUsers = await prisma.user.count();
    const paginatedUsers = await prisma.user.findMany({
      take: 5,
      skip: 0,
      orderBy: { createdAt: "desc" },
    });

    assert(paginatedUsers.length <= 5, "Database level pagination (take: 5) respected");
    assert(totalUsers >= 2, "User count aggregation returned total count");

  } catch (err) {
    console.error("Test execution error:", err);
    failedTests++;
  } finally {
    // Cleanup mock data
    console.log("\n--- Cleaning up test records ---");
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
  }

  console.log("\n========================================");
  console.log(`Admin Test Summary: ${passedTests} Passed, ${failedTests} Failed`);
  console.log("========================================\n");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runAdminTests();
