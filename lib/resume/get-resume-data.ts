import { prisma } from "@/lib/prisma";
import { ResumeData, ResumeSocialLink, ResumeTemplateType } from "./types";

/**
 * Fetches and normalizes all profile, section, and settings data required for rendering a user's resume.
 */
export async function getResumeData(userId: string): Promise<ResumeData | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      profile: true,
      skills: {
        orderBy: { displayOrder: "asc" },
      },
      experience: {
        orderBy: { startDate: "desc" },
      },
      education: {
        orderBy: { startDate: "desc" },
      },
      projects: {
        orderBy: { displayOrder: "asc" },
      },
      resumeSettings: true,
      customDomains: {
        where: { status: { in: ["VERIFIED", "ACTIVE"] } },
        select: { domain: true, isPrimary: true },
      },
    },
  });

  if (!user) return null;

  // Get or create ResumeSettings
  let settings = user.resumeSettings;
  if (!settings) {
    settings = await prisma.resumeSettings.create({
      data: {
        userId,
        template: "PROFESSIONAL",
        showSummary: true,
        showSkills: true,
        showExperience: true,
        showEducation: true,
        showProjects: true,
        showSocialLinks: true,
      },
    });
  }

  const profile = user.profile;

  // Build social links list
  const socialLinks: ResumeSocialLink[] = [];
  if (profile?.github) {
    const url = profile.github.startsWith("http")
      ? profile.github
      : `https://github.com/${profile.github}`;
    socialLinks.push({ platform: "GitHub", url });
  }
  if (profile?.linkedin) {
    const url = profile.linkedin.startsWith("http")
      ? profile.linkedin
      : `https://linkedin.com/in/${profile.linkedin}`;
    socialLinks.push({ platform: "LinkedIn", url });
  }

  // Primary website/portfolio link
  let websiteUrl = profile?.website || null;
  if (!websiteUrl && user.username) {
    websiteUrl = `https://myfolio.com/${user.username}`;
  }

  return {
    profile: {
      name: profile?.fullName || user.name || user.username || "Anonymous User",
      headline: profile?.headline || null,
      summary: profile?.bio || null,
      email: (profile?.showEmail && profile?.email) || user.email || null,
      phone: (profile?.showPhone && profile?.phone) || null,
      location: profile?.location || null,
      website: websiteUrl,
    },
    socialLinks,
    skills: user.skills.map((s) => ({
      id: s.id,
      name: s.name,
      category: s.category || null,
      proficiency: s.proficiency || null,
    })),
    experience: user.experience.map((e) => ({
      id: e.id,
      company: e.company,
      position: e.position,
      employmentType: e.employmentType,
      location: e.location || null,
      startDate: e.startDate.toISOString(),
      endDate: e.endDate ? e.endDate.toISOString() : null,
      current: e.current,
      description: e.description || null,
    })),
    education: user.education.map((e) => ({
      id: e.id,
      institution: e.institution,
      degree: e.degree,
      fieldOfStudy: e.fieldOfStudy || null,
      customDegree: e.customDegree || null,
      customFieldOfStudy: e.customFieldOfStudy || null,
      location: e.location || null,
      startDate: e.startDate.toISOString(),
      endDate: e.endDate ? e.endDate.toISOString() : null,
      current: e.current,
      grade: e.grade || null,
      description: e.description || null,
    })),
    projects: user.projects.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      liveUrl: p.liveUrl || null,
      githubUrl: p.githubUrl || null,
      technologies: p.technologies || [],
    })),
    settings: {
      template: settings.template as ResumeTemplateType,
      showSummary: settings.showSummary,
      showSkills: settings.showSkills,
      showExperience: settings.showExperience,
      showEducation: settings.showEducation,
      showProjects: settings.showProjects,
      showSocialLinks: settings.showSocialLinks,
    },
  };
}
