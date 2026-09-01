"use client";

import Link from "next/link";
import {
  MapPin,
  Globe,
  Mail,
  Phone,
  ArrowUpRight,
} from "lucide-react";
import { GithubIcon, LinkedinIcon, TwitterIcon } from "@/components/SocialIcons";
import { PortfolioData, PortfolioCustomization } from "@/types/portfolio";
import {
  EMPLOYMENT_TYPE_LABELS,
  EmploymentTypeEnum,
  formatExperienceDate,
} from "@/lib/validations/experience";
import { formatEducationDate } from "@/lib/validations/education";
import {
  getDegreeLabel,
  getFieldOfStudyLabel,
} from "@/lib/constants/education-options";
import {
  DEFAULT_CUSTOMIZATION,
  getButtonStyleClass,
  getBorderRadiusClass,
} from "@/lib/constants/portfolio-customization";

interface MinimalTemplateProps {
  portfolioData: PortfolioData;
  customization?: PortfolioCustomization;
}

export default function MinimalTemplate({
  portfolioData,
  customization = DEFAULT_CUSTOMIZATION,
}: MinimalTemplateProps) {
  const { profile, projects, skills, experience, education, username, name } = portfolioData;

  const displayName = profile?.fullName || name || username;

  const buttonClass = getButtonStyleClass(customization.buttonStyle);
  const cardRadiusClass = getBorderRadiusClass(customization.borderRadius);
  const primaryColor = customization.themeColor;
  const isLight = customization.themeMode === "LIGHT";

  const hasAbout = customization.showAbout;
  const hasProjects = customization.showProjects && projects.length > 0;
  const hasExperience = customization.showExperience && experience.length > 0;
  const hasEducation = customization.showEducation && education.length > 0;
  const hasSkills = customization.showSkills && skills.length > 0;
  const hasContact = customization.showContact && Boolean(
    profile?.website ||
      profile?.github ||
      profile?.linkedin ||
      profile?.twitter ||
      (profile?.showEmail && profile?.email) ||
      (profile?.showPhone && profile?.phone)
  );
  const hasSocial = customization.showSocialLinks;

  return (
    <div
      className={`min-h-screen font-sans ${
        isLight ? "bg-slate-50 text-slate-900" : "bg-slate-950 text-slate-200"
      }`}
    >
      {/* Minimal Header */}
      <header
        className={`border-b sticky top-0 z-30 backdrop-blur-md ${
          isLight
            ? "bg-white/90 border-slate-200"
            : "bg-slate-950/90 border-slate-900"
        }`}
      >
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href={`/${username}`}
            className="text-sm font-semibold tracking-tight hover:opacity-80 transition-opacity"
          >
            {displayName}
          </Link>

          <nav className="flex items-center gap-6 text-xs font-medium opacity-70">
            {hasProjects && <a href="#projects" className="hover:opacity-100 transition-opacity">Projects</a>}
            {hasExperience && <a href="#experience" className="hover:opacity-100 transition-opacity">Experience</a>}
            {hasEducation && <a href="#education" className="hover:opacity-100 transition-opacity">Education</a>}
            {hasSkills && <a href="#skills" className="hover:opacity-100 transition-opacity">Skills</a>}
            {hasContact && <a href="#contact" className="hover:opacity-100 transition-opacity">Contact</a>}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-16 sm:py-24 space-y-20">
        {/* ABOUT SECTION */}
        {hasAbout && (
          <section className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {displayName}
              </h1>

              {profile?.headline && (
                <p
                  className="text-base sm:text-lg font-medium"
                  style={{ color: primaryColor }}
                >
                  {profile.headline}
                </p>
              )}

              {profile?.location && (
                <p className="text-xs opacity-60 flex items-center gap-1 font-mono pt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{profile.location}</span>
                </p>
              )}
            </div>

            {profile?.bio && (
              <p className="text-sm sm:text-base leading-relaxed font-normal pt-2 opacity-90">
                {profile.bio}
              </p>
            )}

            {/* Social Links */}
            {hasSocial && (
              <div className={`flex flex-wrap items-center gap-4 text-xs font-mono pt-2 border-t ${isLight ? "border-slate-200" : "border-slate-900"}`}>
                {profile?.website && (
                  <a
                    href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-100 opacity-70 transition-opacity inline-flex items-center gap-1"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Website</span>
                  </a>
                )}

                {profile?.github && (
                  <a
                    href={profile.github.startsWith("http") ? profile.github : `https://github.com/${profile.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-100 opacity-70 transition-opacity inline-flex items-center gap-1"
                  >
                    <GithubIcon className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                  </a>
                )}

                {profile?.linkedin && (
                  <a
                    href={profile.linkedin.startsWith("http") ? profile.linkedin : `https://linkedin.com/in/${profile.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-100 opacity-70 transition-opacity inline-flex items-center gap-1"
                  >
                    <LinkedinIcon className="w-3.5 h-3.5" />
                    <span>LinkedIn</span>
                  </a>
                )}

                {profile?.twitter && (
                  <a
                    href={profile.twitter.startsWith("http") ? profile.twitter : `https://twitter.com/${profile.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-100 opacity-70 transition-opacity inline-flex items-center gap-1"
                  >
                    <TwitterIcon className="w-3.5 h-3.5" />
                    <span>Twitter</span>
                  </a>
                )}
              </div>
            )}
          </section>
        )}

        {/* PROJECTS SECTION */}
        {hasProjects && (
          <section id="projects" className={`space-y-8 pt-8 border-t ${isLight ? "border-slate-200" : "border-slate-900"}`}>
            <h2 className="text-xs font-mono uppercase tracking-widest opacity-60">
              Selected Projects
            </h2>

            <div className="space-y-10">
              {projects.map((project) => (
                <div key={project.id} className="space-y-3 group">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="text-base font-bold transition-colors">
                      {project.title}
                    </h3>

                    <div className="flex items-center gap-3 text-xs font-mono opacity-70 shrink-0">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:opacity-100 transition-opacity inline-flex items-center gap-0.5"
                        >
                          <span>GitHub</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </a>
                      )}
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold inline-flex items-center gap-0.5"
                          style={{ color: primaryColor }}
                        >
                          <span>Live Demo</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm leading-relaxed font-normal opacity-80">
                    {project.description}
                  </p>

                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2 text-[11px] font-mono opacity-60 pt-1">
                      {project.technologies.map((tech, idx) => (
                        <span key={idx}>#{tech}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* EXPERIENCE SECTION */}
        {hasExperience && (
          <section id="experience" className={`space-y-8 pt-8 border-t ${isLight ? "border-slate-200" : "border-slate-900"}`}>
            <h2 className="text-xs font-mono uppercase tracking-widest opacity-60">
              Work Experience
            </h2>

            <div className="space-y-8">
              {experience.map((exp) => {
                const empLabel =
                  EMPLOYMENT_TYPE_LABELS[exp.employmentType as EmploymentTypeEnum] ||
                  exp.employmentType;
                const startStr = formatExperienceDate(exp.startDate);
                const endStr = exp.current
                  ? "Present"
                  : formatExperienceDate(exp.endDate);
                const dateRange = `${startStr} — ${endStr}`;

                return (
                  <div key={exp.id} className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                      <div>
                        <h3 className="text-base font-bold">
                          {exp.position}
                        </h3>
                        <p className="text-xs font-semibold opacity-70">
                          {exp.company} {exp.location ? `· ${exp.location}` : ""} ({empLabel})
                        </p>
                      </div>

                      <span className="text-xs font-mono opacity-60 shrink-0">
                        {dateRange}
                      </span>
                    </div>

                    {exp.description && (
                      <p className="text-xs sm:text-sm leading-relaxed font-normal pt-1 opacity-80 whitespace-pre-line">
                        {exp.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* EDUCATION SECTION */}
        {hasEducation && (
          <section id="education" className={`space-y-8 pt-8 border-t ${isLight ? "border-slate-200" : "border-slate-900"}`}>
            <h2 className="text-xs font-mono uppercase tracking-widest opacity-60">
              Education
            </h2>

            <div className="space-y-8">
              {education.map((edu) => {
                const startStr = formatEducationDate(edu.startDate);
                const endStr = edu.current
                  ? "Present"
                  : formatEducationDate(edu.endDate);
                const dateRange = `${startStr} — ${endStr}`;
                const degreeLabel = getDegreeLabel(edu.degree, edu.customDegree);
                const fieldLabel = getFieldOfStudyLabel(edu.fieldOfStudy, edu.customFieldOfStudy);

                return (
                  <div key={edu.id} className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                      <div>
                        <h3 className="text-base font-bold">
                          {degreeLabel}
                          {fieldLabel ? ` in ${fieldLabel}` : ""}
                        </h3>
                        <p className="text-xs font-semibold opacity-70">
                          {edu.institution} {edu.location ? `· ${edu.location}` : ""}{" "}
                          {edu.grade ? `(Grade: ${edu.grade})` : ""}
                        </p>
                      </div>

                      <span className="text-xs font-mono opacity-60 shrink-0">
                        {dateRange}
                      </span>
                    </div>

                    {edu.description && (
                      <p className="text-xs sm:text-sm leading-relaxed font-normal pt-1 opacity-80 whitespace-pre-line">
                        {edu.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* SKILLS SECTION */}
        {hasSkills && (
          <section id="skills" className={`space-y-6 pt-8 border-t ${isLight ? "border-slate-200" : "border-slate-900"}`}>
            <h2 className="text-xs font-mono uppercase tracking-widest opacity-60">
              Skills & Tools
            </h2>

            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill.id}
                  className={`px-3 py-1 ${cardRadiusClass} ${buttonClass} border text-xs font-mono ${
                    isLight
                      ? "bg-white border-slate-200 text-slate-800"
                      : "bg-slate-900 border-slate-800 text-slate-300"
                  }`}
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* CONTACT SECTION */}
        {hasContact && (
          <section id="contact" className={`space-y-6 pt-8 border-t ${isLight ? "border-slate-200" : "border-slate-900"}`}>
            <h2 className="text-xs font-mono uppercase tracking-widest opacity-60">
              Contact
            </h2>

            <div className="space-y-3 text-xs font-mono">
              {profile?.showEmail && profile?.email && (
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 opacity-60" />
                  <a
                    href={`mailto:${profile.email}`}
                    className="hover:underline"
                    style={{ color: primaryColor }}
                  >
                    {profile.email}
                  </a>
                </p>
              )}

              {profile?.showPhone && profile?.phone && (
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 opacity-60" />
                  <a href={`tel:${profile.phone}`} className="hover:underline">
                    {profile.phone}
                  </a>
                </p>
              )}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className={`border-t py-10 text-center text-xs font-mono opacity-60 ${isLight ? "border-slate-200" : "border-slate-900"}`}>
        <p>
          © {new Date().getFullYear()} {displayName} · Built with{" "}
          <Link
            href="/"
            className="underline underline-offset-4"
            style={{ color: primaryColor }}
          >
            MyFolio
          </Link>
        </p>
      </footer>
    </div>
  );
}
