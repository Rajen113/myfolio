-- CreateEnum
CREATE TYPE "PortfolioTemplate" AS ENUM ('MODERN', 'MINIMAL', 'PROFESSIONAL');

-- CreateTable
CREATE TABLE "PortfolioSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "template" "PortfolioTemplate" NOT NULL DEFAULT 'MODERN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortfolioSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PortfolioSettings_userId_key" ON "PortfolioSettings"("userId");

-- CreateIndex
CREATE INDEX "PortfolioSettings_userId_idx" ON "PortfolioSettings"("userId");

-- AddForeignKey
ALTER TABLE "PortfolioSettings" ADD CONSTRAINT "PortfolioSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
