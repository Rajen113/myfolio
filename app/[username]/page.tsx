import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import PortfolioRenderer from "@/components/portfolio/PortfolioRenderer";
import { PortfolioData, PortfolioCustomization } from "@/types/portfolio";
import { DEFAULT_CUSTOMIZATION } from "@/lib/constants/portfolio-customization";
import { getPrimaryPortfolioUrl } from "@/lib/utils/portfolio-url";

interface PublicPortfolioPageProps {
  params: Promise<{
    username: string;
  }>;
}

/**
 * Helper to lookup user by either username or verified custom domain
 */
async function findUserForPortfolio(param: string) {
  const cleanParam = decodeURIComponent(param).toLowerCase().trim();

  // 1. Try finding user directly by unique username
  const userByUsername = await prisma.user.findUnique({
    where: { username: cleanParam },
    select: {
      id: true,
      name: true,
      username: true,
      customDomains: {
        where: { status: { in: ["VERIFIED", "ACTIVE"] } },
        select: { domain: true, status: true, isPrimary: true },
      },
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

  if (userByUsername) return userByUsername;

  // 2. If not found by username, try finding by custom domain
  const domainCandidates = [cleanParam];
  if (cleanParam.startsWith("www.")) {
    domainCandidates.push(cleanParam.replace(/^www\./, ""));
  }

  const customDomain = await prisma.customDomain.findFirst({
    where: {
      domain: { in: domainCandidates },
      status: { in: ["VERIFIED", "ACTIVE"] },
    },
    select: {
      userId: true,
    },
  });

  if (!customDomain) return null;

  return await prisma.user.findUnique({
    where: { id: customDomain.userId },
    select: {
      id: true,
      name: true,
      username: true,
      customDomains: {
        where: { status: { in: ["VERIFIED", "ACTIVE"] } },
        select: { domain: true, status: true, isPrimary: true },
      },
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
}

export async function generateMetadata({
  params,
}: PublicPortfolioPageProps): Promise<Metadata> {
  const { username } = await params;
  const user = await findUserForPortfolio(username);

  if (!user || !user.portfolioSettings?.isPublished) {
    return {
      title: "Page Not Found — MyFolio",
      robots: { index: false, follow: false },
    };
  }

  const titleName = user.profile?.fullName || user.name || user.username || "User";
  const titleHeadline = user.profile?.headline || "Portfolio";
  const generatedTitle = `${titleName} | ${titleHeadline}`;

  const metaTitle = user.portfolioSettings?.seoTitle || generatedTitle;

  const generatedDesc =
    user.profile?.bio?.slice(0, 160) ||
    `View ${titleName}'s professional portfolio, projects, skills, experience, and education on MyFolio.`;

  const metaDescription = user.portfolioSettings?.seoDescription || generatedDesc;

  const canonicalUrl = getPrimaryPortfolioUrl({
    username: user.username,
    customDomains: user.customDomains,
  });

  const ogImageUrl = `${canonicalUrl}/opengraph-image`;

  return {
    title: metaTitle,
    description: metaDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: canonicalUrl,
      siteName: "MyFolio",
      type: "website",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${titleName} Portfolio Preview`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      images: [ogImageUrl],
    },
  };
}

export default async function PublicPortfolioPage({
  params,
}: PublicPortfolioPageProps) {
  const { username: rawUsername } = await params;
  const user = await findUserForPortfolio(rawUsername);

  // If user does not exist or portfolio is not published, return 404 (do not leak private drafts)
  if (!user || !user.portfolioSettings || !user.portfolioSettings.isPublished) {
    notFound();
  }

  // Transform Prisma records into clean PortfolioData DTO
  const portfolioData: PortfolioData = {
    username: user.username || rawUsername,
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

  const canonicalUrl = getPrimaryPortfolioUrl({
    username: user.username,
    customDomains: user.customDomains,
  });

  const titleName = user.profile?.fullName || user.name || user.username || "User";

  // Build safe JSON-LD structured data object for Person and WebSite
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${canonicalUrl}#person`,
        name: titleName,
        jobTitle: user.profile?.headline || undefined,
        description: user.profile?.bio || undefined,
        url: canonicalUrl,
        image: user.profile?.profileImage || undefined,
        sameAs: [
          user.profile?.website,
          user.profile?.github,
          user.profile?.linkedin,
        ].filter(Boolean),
      },
      {
        "@type": "WebSite",
        "@id": `${canonicalUrl}#website`,
        url: canonicalUrl,
        name: `${titleName} Portfolio`,
        publisher: {
          "@id": `${canonicalUrl}#person`,
        },
      },
    ],
  };

  const safeJsonLdString = JSON.stringify(jsonLd).replace(/</g, "\\u003c");

  return (
    <>
      {/* Safe JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdString }}
      />
      <PortfolioRenderer
        portfolioData={portfolioData}
        template={selectedTemplate}
        customization={customization}
      />
    </>
  );
}
