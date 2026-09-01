export interface PortfolioProfile {
  fullName: string | null;
  headline: string | null;
  bio: string | null;
  profileImage: string | null;
  location: string | null;
  website: string | null;
  github: string | null;
  linkedin: string | null;
  twitter?: string | null;
  email: string | null;
  phone: string | null;
  showEmail: boolean;
  showPhone: boolean;
}

export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  image: string | null;
  liveUrl: string | null;
  githubUrl: string | null;
  technologies: string[];
  featured: boolean;
}

export type SkillProficiencyValue =
  | "BEGINNER"
  | "INTERMEDIATE"
  | "ADVANCED"
  | "EXPERT"
  | number;

export interface PortfolioSkill {
  id: string;
  name: string;
  category: string | null;
  proficiency: SkillProficiencyValue;
}

export interface PortfolioExperience {
  id: string;
  company: string;
  position: string;
  employmentType: string;
  location: string | null;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string | null;
}

export interface PortfolioEducation {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string | null;
  customDegree: string | null;
  customFieldOfStudy: string | null;
  location: string | null;
  startDate: string;
  endDate: string | null;
  current: boolean;
  grade: string | null;
  description: string | null;
}

export interface PortfolioData {
  username: string;
  name: string | null;
  profile: PortfolioProfile | null;
  projects: PortfolioProject[];
  skills: PortfolioSkill[];
  experience: PortfolioExperience[];
  education: PortfolioEducation[];
}

export function getProficiencyPercentage(proficiency: SkillProficiencyValue): number {
  if (typeof proficiency === "number") return proficiency;
  switch (proficiency) {
    case "BEGINNER":
      return 30;
    case "INTERMEDIATE":
      return 60;
    case "ADVANCED":
      return 85;
    case "EXPERT":
      return 100;
    default:
      return 50;
  }
}

export function getProficiencyLabel(proficiency: SkillProficiencyValue): string {
  if (typeof proficiency === "number") return `${proficiency}%`;
  switch (proficiency) {
    case "BEGINNER":
      return "Beginner";
    case "INTERMEDIATE":
      return "Intermediate";
    case "ADVANCED":
      return "Advanced";
    case "EXPERT":
      return "Expert";
    default:
      return String(proficiency);
  }
}
