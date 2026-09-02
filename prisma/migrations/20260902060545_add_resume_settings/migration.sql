-- CreateEnum
CREATE TYPE "ResumeTemplate" AS ENUM ('PROFESSIONAL', 'MODERN', 'MINIMAL');

-- CreateTable
CREATE TABLE "ResumeSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "template" "ResumeTemplate" NOT NULL DEFAULT 'PROFESSIONAL',
    "showSummary" BOOLEAN NOT NULL DEFAULT true,
    "showSkills" BOOLEAN NOT NULL DEFAULT true,
    "showExperience" BOOLEAN NOT NULL DEFAULT true,
    "showEducation" BOOLEAN NOT NULL DEFAULT true,
    "showProjects" BOOLEAN NOT NULL DEFAULT true,
    "showSocialLinks" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResumeSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ResumeSettings_userId_key" ON "ResumeSettings"("userId");

-- CreateIndex
CREATE INDEX "ResumeSettings_userId_idx" ON "ResumeSettings"("userId");

-- AddForeignKey
ALTER TABLE "ResumeSettings" ADD CONSTRAINT "ResumeSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
