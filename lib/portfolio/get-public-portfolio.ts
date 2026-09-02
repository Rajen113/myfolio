import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export interface PublicPortfolioUser {
  id: string;
  name: string | null;
  username: string | null;
  customDomains: Array<{
    domain: string;
    status: string;
    isPrimary: boolean;
  }>;
  profile: {
    fullName: string;
    headline: string | null;
    bio: string | null;
    profileImage: string | null;
    location: string | null;
    website: string | null;
    github: string | null;
    linkedin: string | null;
    email: string | null;
    phone: string | null;
    showEmail: boolean;
    showPhone: boolean;
  } | null;
  portfolioSettings: {
    id: string;
    template: "MODERN" | "MINIMAL" | "PROFESSIONAL";
    themeMode: "LIGHT" | "DARK" | "SYSTEM";
    themeColor: string;
    fontFamily: "INTER" | "PLUS_JAKARTA_SANS" | "DM_SANS" | "MANROPE";
    showAbout: boolean;
    showSkills: boolean;
    showProjects: boolean;
    showExperience: boolean;
    showEducation: boolean;
    showContact: boolean;
    showSocialLinks: boolean;
    buttonStyle: "ROUNDED" | "PILL" | "SQUARE";
    borderRadius: "SMALL" | "MEDIUM" | "LARGE";
    isPublished: boolean;
    seoTitle: string | null;
    seoDescription: string | null;
  } | null;
  projects: Array<{
    id: string;
    title: string;
    description: string;
    image: string | null;
    liveUrl: string | null;
    githubUrl: string | null;
    technologies: string[];
    featured: boolean;
  }>;
  skills: Array<{
    id: string;
    name: string;
    category: string | null;
    proficiency: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  }>;
  experience: Array<{
    id: string;
    company: string;
    position: string;
    employmentType: string;
    location: string | null;
    startDate: Date;
    endDate: Date | null;
    current: boolean;
    description: string | null;
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    fieldOfStudy: string | null;
    customDegree: string | null;
    customFieldOfStudy: string | null;
    location: string | null;
    startDate: Date;
    endDate: Date | null;
    current: boolean;
    grade: string | null;
    description: string | null;
  }>;
}

/**
 * Raw internal query to fetch public portfolio data by username or custom domain.
 * Strictly selects ONLY public fields required for portfolio rendering.
 */
async function fetchPublicPortfolioRaw(
  param: string
): Promise<PublicPortfolioUser | null> {
  const cleanParam = decodeURIComponent(param).toLowerCase().trim();

  // 1. Try finding user directly by unique username
  let user = await prisma.user.findUnique({
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
      portfolioSettings: {
        select: {
          id: true,
          template: true,
          themeMode: true,
          themeColor: true,
          fontFamily: true,
          showAbout: true,
          showSkills: true,
          showProjects: true,
          showExperience: true,
          showEducation: true,
          showContact: true,
          showSocialLinks: true,
          buttonStyle: true,
          borderRadius: true,
          isPublished: true,
          seoTitle: true,
          seoDescription: true,
        },
      },
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

  // 2. If not found by username, try custom domain resolution
  if (!user) {
    const domainCandidates = [cleanParam];
    if (cleanParam.startsWith("www.")) {
      domainCandidates.push(cleanParam.replace(/^www\./, ""));
    }

    const customDomain = await prisma.customDomain.findFirst({
      where: {
        domain: { in: domainCandidates },
        status: { in: ["VERIFIED", "ACTIVE"] },
      },
      select: { userId: true },
    });

    if (customDomain) {
      user = await prisma.user.findUnique({
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
          portfolioSettings: {
            select: {
              id: true,
              template: true,
              themeMode: true,
              themeColor: true,
              fontFamily: true,
              showAbout: true,
              showSkills: true,
              showProjects: true,
              showExperience: true,
              showEducation: true,
              showContact: true,
              showSocialLinks: true,
              buttonStyle: true,
              borderRadius: true,
              isPublished: true,
              seoTitle: true,
              seoDescription: true,
            },
          },
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
  }

  // 3. Strict Check: If portfolio does not exist or is NOT published, return null
  if (!user || !user.portfolioSettings || !user.portfolioSettings.isPublished) {
    return null;
  }

  return user as PublicPortfolioUser;
}

/**
 * Centralized, cached public portfolio loader using Next.js unstable_cache.
 * Efficiently caches public portfolio payloads and revalidates on user mutations.
 */
export async function getPublicPortfolioData(
  param: string
): Promise<PublicPortfolioUser | null> {
  const cleanParam = decodeURIComponent(param).toLowerCase().trim();

  const cachedFetcher = unstable_cache(
    async () => fetchPublicPortfolioRaw(cleanParam),
    [`public-portfolio:${cleanParam}`],
    {
      revalidate: 3600, // 1 hour stale-while-revalidate fallback
      tags: [
        `portfolio:domain:${cleanParam}`,
        `portfolio:username:${cleanParam}`,
        "portfolio:all",
      ],
    }
  );

  return await cachedFetcher();
}
