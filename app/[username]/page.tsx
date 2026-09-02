import { notFound } from "next/navigation";
import { Metadata } from "next";
import { headers } from "next/headers";
import PortfolioRenderer from "@/components/portfolio/PortfolioRenderer";
import { PortfolioData, PortfolioCustomization } from "@/types/portfolio";
import { DEFAULT_CUSTOMIZATION } from "@/lib/constants/portfolio-customization";
import { getPrimaryPortfolioUrl } from "@/lib/utils/portfolio-url";
import { recordPortfolioView } from "@/lib/analytics/record-view";
import { getPublicPortfolioData } from "@/lib/portfolio/get-public-portfolio";

interface PublicPortfolioPageProps {
  params: Promise<{
    username: string;
  }>;
}

export async function generateMetadata({
  params,
}: PublicPortfolioPageProps): Promise<Metadata> {
  const { username } = await params;
  const user = await getPublicPortfolioData(username);

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
  const user = await getPublicPortfolioData(rawUsername);

  // If user does not exist or portfolio is not published, return 404
  if (!user || !user.portfolioSettings || !user.portfolioSettings.isPublished) {
    notFound();
  }

  // Asynchronously record view event without blocking main server rendering pipeline
  try {
    const reqHeaders = await headers();
    const userAgent = reqHeaders.get("user-agent");
    const referer = reqHeaders.get("referer");
    const host = reqHeaders.get("host");
    const ip = reqHeaders.get("x-forwarded-for")?.split(",")[0] || reqHeaders.get("x-real-ip");
    const countryCode =
      reqHeaders.get("x-vercel-ip-country") ||
      reqHeaders.get("cf-ipcountry") ||
      reqHeaders.get("x-country") ||
      reqHeaders.get("cloudfront-viewer-country");

    recordPortfolioView({
      userId: user.id,
      portfolioId: user.portfolioSettings.id,
      isPublished: user.portfolioSettings.isPublished,
      userAgent,
      referer,
      host,
      ip,
      countryCode,
    }).catch(() => {});
  } catch {
    // Non-blocking error isolation
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
      startDate: new Date(exp.startDate).toISOString(),
      endDate: exp.endDate ? new Date(exp.endDate).toISOString() : null,
    })),
    education: user.education.map((edu) => ({
      ...edu,
      startDate: new Date(edu.startDate).toISOString(),
      endDate: edu.endDate ? new Date(edu.endDate).toISOString() : null,
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
