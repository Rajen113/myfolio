import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import PortfolioRenderer from "@/components/portfolio/PortfolioRenderer";
import { PortfolioData } from "@/types/portfolio";

interface PublicPortfolioPageProps {
  params: Promise<{
    username: string;
  }>;
}

export async function generateMetadata({
  params,
}: PublicPortfolioPageProps): Promise<Metadata> {
  const { username } = await params;
  const normalizedUsername = username.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { username: normalizedUsername },
    select: {
      name: true,
      username: true,
      profile: {
        select: {
          fullName: true,
          headline: true,
          bio: true,
        },
      },
    },
  });

  if (!user) {
    return {
      title: "User Not Found — MyFolio",
      description: "The requested user profile does not exist.",
    };
  }

  const name = user.profile?.fullName || user.name || user.username || username;
  const headline = user.profile?.headline ? ` | ${user.profile.headline}` : "";
  const bio = user.profile?.bio || `Official developer portfolio of ${name} hosted on MyFolio.`;

  return {
    title: `${name}${headline}`,
    description: bio.length > 160 ? `${bio.slice(0, 157)}...` : bio,
  };
}

export default async function PublicPortfolioPage({
  params,
}: PublicPortfolioPageProps) {
  const { username } = await params;
  const normalizedUsername = username.toLowerCase();

  // Query PostgreSQL database for user, profile, portfolioSettings, and sections
  const user = await prisma.user.findUnique({
    where: { username: normalizedUsername },
    select: {
      id: true,
      name: true,
      username: true,
      createdAt: true,
      profile: true,
      portfolioSettings: {
        select: {
          template: true,
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

  // If user does not exist in database, render 404
  if (!user) {
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

  const selectedTemplate = user.portfolioSettings?.template || "MODERN";

  return (
    <PortfolioRenderer
      portfolioData={portfolioData}
      template={selectedTemplate}
    />
  );
}
