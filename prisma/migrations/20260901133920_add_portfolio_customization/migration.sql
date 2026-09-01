-- CreateEnum
CREATE TYPE "ThemeMode" AS ENUM ('LIGHT', 'DARK', 'SYSTEM');

-- CreateEnum
CREATE TYPE "FontFamily" AS ENUM ('INTER', 'PLUS_JAKARTA_SANS', 'DM_SANS', 'MANROPE');

-- CreateEnum
CREATE TYPE "ButtonStyle" AS ENUM ('ROUNDED', 'PILL', 'SQUARE');

-- CreateEnum
CREATE TYPE "BorderRadius" AS ENUM ('SMALL', 'MEDIUM', 'LARGE');

-- AlterTable
ALTER TABLE "PortfolioSettings" ADD COLUMN     "borderRadius" "BorderRadius" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "buttonStyle" "ButtonStyle" NOT NULL DEFAULT 'ROUNDED',
ADD COLUMN     "fontFamily" "FontFamily" NOT NULL DEFAULT 'INTER',
ADD COLUMN     "showAbout" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showContact" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showEducation" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showExperience" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showProjects" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showSkills" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showSocialLinks" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "themeColor" TEXT NOT NULL DEFAULT '#2563EB',
ADD COLUMN     "themeMode" "ThemeMode" NOT NULL DEFAULT 'SYSTEM';
