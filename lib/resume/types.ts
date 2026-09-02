export type ResumeTemplateType = "PROFESSIONAL" | "MODERN" | "MINIMAL";

export interface ResumeSocialLink {
  platform: string;
  url: string;
}

export interface ResumeSkillItem {
  id: string;
  name: string;
  category?: string | null;
  proficiency?: string | null;
}

export interface ResumeExperienceItem {
  id: string;
  company: string;
  position: string;
  employmentType: string;
  location?: string | null;
  startDate: string;
  endDate?: string | null;
  current: boolean;
  description?: string | null;
}

export interface ResumeEducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string | null;
  customDegree?: string | null;
  customFieldOfStudy?: string | null;
  location?: string | null;
  startDate: string;
  endDate?: string | null;
  current: boolean;
  grade?: string | null;
  description?: string | null;
}

export interface ResumeProjectItem {
  id: string;
  title: string;
  description: string;
  liveUrl?: string | null;
  githubUrl?: string | null;
  technologies: string[];
}

export interface ResumeSettingsDTO {
  template: ResumeTemplateType;
  showSummary: boolean;
  showSkills: boolean;
  showExperience: boolean;
  showEducation: boolean;
  showProjects: boolean;
  showSocialLinks: boolean;
}

export interface ResumeData {
  profile: {
    name: string;
    headline?: string | null;
    summary?: string | null;
    email?: string | null;
    phone?: string | null;
    location?: string | null;
    website?: string | null;
  };
  socialLinks: ResumeSocialLink[];
  skills: ResumeSkillItem[];
  experience: ResumeExperienceItem[];
  education: ResumeEducationItem[];
  projects: ResumeProjectItem[];
  settings: ResumeSettingsDTO;
}
