import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import PortfolioRenderer from "@/components/portfolio/PortfolioRenderer";
import { PortfolioData, PortfolioCustomization } from "@/types/portfolio";
import { DEFAULT_CUSTOMIZATION } from "@/lib/constants/portfolio-customization";

interface PublicPortfolioPageProps {
  params: Promise<{
    username: string;
  }>;
}

export async function generateMetadata({
  params,
}: PublicPortfolioPageProps): Promise<Metadata> {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username);

  const user = await prisma.user.findUnique({
    where: { username: decodedUsername },
    select: {
      name: true,
      username: true,
      portfolioSettings: {
        select: { isPublished: true },
      },
      profile: {
        select: {
          fullName: true,
          headline: true,
          bio: true,
        },
      },
    },
  });

  if (!user || !user.portfolioSettings?.isPublished) {
    return {
      title: "Page Not Found — MyFolio",
    };
  }

  const titleName = user.profile?.fullName || user.name || user.username || "User";
  const titleHeadline = user.profile?.headline
    ? ` — ${user.profile.headline}`
    : " — Portfolio";

  return {
    title: `${titleName}${titleHeadline} | MyFolio`,
    description:
      user.profile?.bio?.slice(0, 160) ||
      `View ${titleName}'s professional portfolio, projects, skills, experience, and education on MyFolio.`,
  };
}

export default async function PublicPortfolioPage({
  params,
}: PublicPortfolioPageProps) {
  const { username: rawUsername } = await params;
  const username = decodeURIComponent(rawUsername);

  // Query user by unique username with related profile, projects, skills, experience, education, portfolioSettings
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      username: true,
      profile: {
        select: {
          fullName: true,
          headline: true,
          bio: true,
          profileImage: true,
          location: true,
          website: true,
          github: true,
          linkedin: true,
          email: true,
          phone: true,
          showEmail: true,
          showPhone: true,
        },
      },
      portfolioSettings: true,
      projects: {
        select: {
          id: true,
          title: true,
          description: true,
          image: true,
          liveUrl: true,
          githubUrl: true,
          technologies: true,
          featured: true,
        },
        orderBy: [
          { featured: "desc" },
          { displayOrder: "asc" },
          { createdAt: "desc" },
        ],
      },
      skills: {
        select: {
          id: true,
          name: true,
          category: true,
          proficiency: true,
        },
        orderBy: [
          { displayOrder: "asc" },
          { createdAt: "desc" },
        ],
      },
      experience: {
        select: {
          id: true,
          company: true,
          position: true,
          employmentType: true,
          location: true,
          startDate: true,
          endDate: true,
          current: true,
          description: true,
        },
        orderBy: [
          { current: "desc" },
          { displayOrder: "asc" },
          { startDate: "desc" },
        ],
      },
      education: {
        select: {
          id: true,
          institution: true,
          degree: true,
          fieldOfStudy: true,
          customDegree: true,
          customFieldOfStudy: true,
          location: true,
          startDate: true,
          endDate: true,
          current: true,
          grade: true,
          description: true,
        },
        orderBy: [
          { current: "desc" },
          { displayOrder: "asc" },
          { startDate: "desc" },
          { createdAt: "desc" },
        ],
      },
    },
  });

  // If user does not exist or portfolio is not published, return 404 (do not leak private drafts)
  if (!user || !user.portfolioSettings || !user.portfolioSettings.isPublished) {
    notFound();
  }

  // Transform Prisma records into clean PortfolioData DTO
  const portfolioData: PortfolioData = {
    username: user.username || username,
    name: user.name,
    profile: user.profile
      ? {
          fullName: user.profile.fullName,
          headline: user.profile.headline,
          bio: user.profile.bio,
          profileImage: user.profile.profileImage,
          location: user.profile.location,
          website: user.profile.website,
          github: user.profile.github,
          linkedin: user.profile.linkedin,
          twitter: null,
          email: user.profile.email,
          phone: user.profile.phone,
          showEmail: user.profile.showEmail,
          showPhone: user.profile.showPhone,
        }
      : null,
    projects: user.projects,
    skills: user.skills,
    experience: user.experience.map((exp) => ({
      ...exp,
      startDate: exp.startDate.toISOString(),
      endDate: exp.endDate ? exp.endDate.toISOString() : null,
    })),
    education: user.education.map((edu) => ({
      ...edu,
      startDate: edu.startDate.toISOString(),
      endDate: edu.endDate ? edu.endDate.toISOString() : null,
    })),
  };

  const dbSettings = user.portfolioSettings;
  const selectedTemplate = dbSettings?.template || "MODERN";

  const customization: PortfolioCustomization = {
    themeMode: dbSettings?.themeMode || DEFAULT_CUSTOMIZATION.themeMode,
    themeColor: dbSettings?.themeColor || DEFAULT_CUSTOMIZATION.themeColor,
    fontFamily: dbSettings?.fontFamily || DEFAULT_CUSTOMIZATION.fontFamily,
    showAbout: dbSettings?.showAbout ?? DEFAULT_CUSTOMIZATION.showAbout,
    showSkills: dbSettings?.showSkills ?? DEFAULT_CUSTOMIZATION.showSkills,
    showProjects: dbSettings?.showProjects ?? DEFAULT_CUSTOMIZATION.showProjects,
    showExperience: dbSettings?.showExperience ?? DEFAULT_CUSTOMIZATION.showExperience,
    showEducation: dbSettings?.showEducation ?? DEFAULT_CUSTOMIZATION.showEducation,
    showContact: dbSettings?.showContact ?? DEFAULT_CUSTOMIZATION.showContact,
    showSocialLinks: dbSettings?.showSocialLinks ?? DEFAULT_CUSTOMIZATION.showSocialLinks,
    buttonStyle: dbSettings?.buttonStyle || DEFAULT_CUSTOMIZATION.buttonStyle,
    borderRadius: dbSettings?.borderRadius || DEFAULT_CUSTOMIZATION.borderRadius,
  };

  return (
    <PortfolioRenderer
      portfolioData={portfolioData}
      template={selectedTemplate}
      customization={customization}
    />
  );
}
