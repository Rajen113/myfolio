import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error("Error: Please provide a user email as an argument.");
    console.log("Usage: npx tsx scripts/create-admin.ts <user-email>");
    process.exit(1);
  }

  const targetEmail = email.toLowerCase().trim();

  try {
    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
    });

    if (!user) {
      console.error(`User with email '${targetEmail}' not found.`);
      process.exit(1);
    }

    if (user.role === UserRole.ADMIN) {
      console.log(`User '${targetEmail}' is already an ADMIN.`);
      process.exit(0);
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role: UserRole.ADMIN },
    });

    console.log(`Successfully promoted user '${updatedUser.email}' to ADMIN role.`);
  } catch (error) {
    console.error("Error promoting user to ADMIN:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
