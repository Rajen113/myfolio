import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PortfolioRenderer from "@/components/portfolio/PortfolioRenderer";
import { PortfolioData, PortfolioCustomization } from "@/types/portfolio";
import { DEFAULT_CUSTOMIZATION } from "@/lib/constants/portfolio-customization";
import PreviewBanner from "./PreviewBanner";

export const metadata = {
  title: "Draft Preview — MyFolio",
  description: "Preview your portfolio in real time before publishing publicly.",
};

export default async function DashboardPreviewPage() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      username: true,
      profile: true,
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

  if (!user) {
    redirect("/login");
  }

  const dbSettings = user.portfolioSettings;
  const isPublished = dbSettings?.isPublished ?? false;
  const currentTemplate = dbSettings?.template || "MODERN";

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

  const portfolioData: PortfolioData = {
    username: user.username || "username",
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
    experience: user.experience.map((e) => ({
      ...e,
      startDate: e.startDate.toISOString(),
      endDate: e.endDate ? e.endDate.toISOString() : null,
    })),
    education: user.education.map((e) => ({
      ...e,
      startDate: e.startDate.toISOString(),
      endDate: e.endDate ? e.endDate.toISOString() : null,
    })),
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PreviewBanner
        isPublished={isPublished}
        username={user.username}
      />
      <div className="flex-1">
        <PortfolioRenderer
          portfolioData={portfolioData}
          template={currentTemplate}
          customization={customization}
        />
      </div>
    </div>
  );
}
