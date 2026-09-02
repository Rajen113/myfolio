"use client";

import Link from "next/link";
import {
  MapPin,
  Globe,
  Mail,
  Phone,
  Briefcase,
  Building2,
  FolderGit2,
  ExternalLink,
  GraduationCap,
  Award,
  CheckCircle2,
} from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/SocialIcons";
import ContactForm from "@/components/portfolio/contact/ContactForm";
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

interface ProfessionalTemplateProps {
  portfolioData: PortfolioData;
  customization?: PortfolioCustomization;
}

export default function ProfessionalTemplate({
  portfolioData,
  customization = DEFAULT_CUSTOMIZATION,
}: ProfessionalTemplateProps) {
  const { profile, projects, skills, experience, education, username, name } =
    portfolioData;

  const displayName = profile?.fullName || name || username;

  // Group skills by category
  const skillsByCategory = skills.reduce<Record<string, typeof skills>>(
    (acc, skill) => {
      const cat = skill.category || "Core Competencies";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(skill);
      return acc;
    },
    {}
  );

  const buttonClass = getButtonStyleClass(customization.buttonStyle);
  const cardRadiusClass = getBorderRadiusClass(customization.borderRadius);
  const primaryColor = customization.themeColor;
  const isLight = customization.themeMode === "LIGHT";

  const hasAbout = customization.showAbout;
  const hasExperience = customization.showExperience && experience.length > 0;
  const hasSkills = customization.showSkills && skills.length > 0;
  const hasProjects = customization.showProjects && projects.length > 0;
  const hasEducation = customization.showEducation && education.length > 0;
  const hasContact = customization.showContact;
  const hasSocial = customization.showSocialLinks;

  return (
    <div
      className={`min-h-screen font-sans py-8 sm:py-12 px-4 sm:px-6 lg:px-8 ${
        isLight ? "bg-slate-100 text-slate-900" : "bg-slate-900 text-slate-100"
      }`}
    >
      {/* Executive Resume Container */}
      <div
        className={`max-w-4xl mx-auto border shadow-2xl overflow-hidden ${cardRadiusClass} ${
          isLight ? "bg-white border-slate-200" : "bg-slate-950 border-slate-800"
        }`}
      >
        {/* EXECUTIVE HEADER */}
        <header
          className={`p-8 sm:p-10 border-b space-y-6 ${
            isLight
              ? "bg-slate-50 border-slate-200"
              : "bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-slate-800"
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              {profile?.profileImage ? (
                <img
                  src={profile.profileImage}
                  alt={displayName}
                  className={`w-20 h-20 sm:w-24 sm:h-24 ${cardRadiusClass} object-cover border-2 shadow-xl shrink-0`}
                  style={{ borderColor: `${primaryColor}60` }}
                />
              ) : (
                <div
                  className={`w-20 h-20 sm:w-24 sm:h-24 ${cardRadiusClass} border-2 flex items-center justify-center font-bold text-2xl shrink-0 text-white`}
                  style={{ backgroundColor: primaryColor, borderColor: `${primaryColor}80` }}
                >
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="space-y-1.5">
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                  {displayName}
                </h1>
                {profile?.headline && (
                  <p
                    className="text-sm sm:text-lg font-semibold"
                    style={{ color: primaryColor }}
                  >
                    {profile.headline}
                  </p>
                )}
                {profile?.location && (
                  <p className="text-xs opacity-70 flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{profile.location}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Contact & Social Bar */}
          <div
            className={`flex flex-wrap items-center gap-3 pt-4 border-t text-xs ${
              isLight ? "border-slate-200" : "border-slate-800/80"
            }`}
          >
            {profile?.showEmail && profile?.email && (
              <a
                href={`mailto:${profile.email}`}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${buttonClass} border ${
                  isLight
                    ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                    : "bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
                } transition-colors`}
              >
                <Mail className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                <span>{profile.email}</span>
              </a>
            )}

            {profile?.showPhone && profile?.phone && (
              <a
                href={`tel:${profile.phone}`}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${buttonClass} border ${
                  isLight
                    ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                    : "bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
                } transition-colors`}
              >
                <Phone className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                <span>{profile.phone}</span>
              </a>
            )}

            {hasSocial && profile?.website && (
              <a
                href={
                  profile.website.startsWith("http")
                    ? profile.website
                    : `https://${profile.website}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${buttonClass} border ${
                  isLight
                    ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                    : "bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
                } transition-colors`}
              >
                <Globe className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                <span>Website</span>
              </a>
            )}

            {hasSocial && profile?.linkedin && (
              <a
                href={
                  profile.linkedin.startsWith("http")
                    ? profile.linkedin
                    : `https://linkedin.com/in/${profile.linkedin}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${buttonClass} border ${
                  isLight
                    ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                    : "bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
                } transition-colors`}
              >
                <LinkedinIcon className="w-3.5 h-3.5 text-sky-500" />
                <span>LinkedIn</span>
              </a>
            )}

            {hasSocial && profile?.github && (
              <a
                href={
                  profile.github.startsWith("http")
                    ? profile.github
                    : `https://github.com/${profile.github}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${buttonClass} border ${
                  isLight
                    ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                    : "bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
                } transition-colors`}
              >
                <GithubIcon className="w-3.5 h-3.5" />
                <span>GitHub</span>
              </a>
            )}
          </div>
        </header>

        {/* RESUME BODY */}
        <div className="p-8 sm:p-10 space-y-10">
          {/* PROFESSIONAL SUMMARY */}
          {hasAbout && profile?.bio && (
            <section className="space-y-3">
              <h2
                className="text-sm font-bold uppercase tracking-wider border-b pb-2"
                style={{ color: primaryColor, borderColor: `${primaryColor}30` }}
              >
                Executive Summary
              </h2>
              <p className="text-sm sm:text-base leading-relaxed opacity-90">
                {profile.bio}
              </p>
            </section>
          )}

          {/* WORK EXPERIENCE */}
          {hasExperience && (
            <section className="space-y-6">
              <h2
                className="text-sm font-bold uppercase tracking-wider border-b pb-2 flex items-center gap-2"
                style={{ color: primaryColor, borderColor: `${primaryColor}30` }}
              >
                <Briefcase className="w-4 h-4" />
                <span>Professional Experience</span>
              </h2>

              <div className="space-y-6">
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
                    <div
                      key={exp.id}
                      className={`p-5 ${cardRadiusClass} border space-y-3 ${
                        isLight
                          ? "bg-slate-50 border-slate-200"
                          : "bg-slate-900/60 border-slate-800/80"
                      }`}
                    >
                      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b pb-2 ${isLight ? "border-slate-200" : "border-slate-800/60"}`}>
                        <div>
                          <h3 className="text-base font-bold">
                            {exp.position}
                          </h3>
                          <p className="text-xs font-semibold flex items-center gap-1.5 mt-0.5">
                            <Building2 className="w-3.5 h-3.5 shrink-0" style={{ color: primaryColor }} />
                            <span>{exp.company}</span>
                            {exp.location && (
                              <span className="font-normal opacity-70">
                                · {exp.location}
                              </span>
                            )}
                          </p>
                        </div>

                        <div
                          className="text-xs font-mono font-semibold shrink-0"
                          style={{ color: primaryColor }}
                        >
                          {dateRange} ({empLabel})
                        </div>
                      </div>

                      {exp.description && (
                        <p className="text-xs sm:text-sm leading-relaxed opacity-90 whitespace-pre-line">
                          {exp.description}
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
            <section className="space-y-4">
              <h2
                className="text-sm font-bold uppercase tracking-wider border-b pb-2"
                style={{ color: primaryColor, borderColor: `${primaryColor}30` }}
              >
                Core Competencies & Skills
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(skillsByCategory).map(([category, catSkills]) => (
                  <div
                    key={category}
                    className={`p-4 ${cardRadiusClass} border space-y-2 ${
                      isLight
                        ? "bg-slate-50 border-slate-200"
                        : "bg-slate-900/60 border-slate-800/80"
                    }`}
                  >
                    <h3 className="text-xs font-bold uppercase tracking-wider opacity-70">
                      {category}
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {catSkills.map((skill) => (
                        <span
                          key={skill.id}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 ${buttonClass} border text-xs font-medium ${
                            isLight
                              ? "bg-white border-slate-200 text-slate-800"
                              : "bg-slate-950 border-slate-800 text-slate-200"
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" style={{ color: primaryColor }} />
                          <span>{skill.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* PROJECTS SECTION */}
          {hasProjects && (
            <section className="space-y-6">
              <h2
                className="text-sm font-bold uppercase tracking-wider border-b pb-2 flex items-center gap-2"
                style={{ color: primaryColor, borderColor: `${primaryColor}30` }}
              >
                <FolderGit2 className="w-4 h-4" />
                <span>Key Projects & Portfolio</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className={`p-4 ${cardRadiusClass} border space-y-3 flex flex-col justify-between ${
                      isLight
                        ? "bg-slate-50 border-slate-200"
                        : "bg-slate-900/60 border-slate-800/80"
                    }`}
                  >
                    <div className="space-y-2">
                      <h3 className="text-sm font-bold">
                        {project.title}
                      </h3>
                      <p className="text-xs opacity-80 leading-relaxed line-clamp-3">
                        {project.description}
                      </p>
                    </div>

                    <div className={`space-y-2 pt-2 border-t ${isLight ? "border-slate-200" : "border-slate-800/60"}`}>
                      {project.technologies && project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 text-[10px] font-mono opacity-70">
                          {project.technologies.map((t, idx) => (
                            <span key={idx}>[{t}]</span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-3 text-xs pt-1">
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="opacity-70 hover:opacity-100 font-medium"
                          >
                            GitHub
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
                            <span>View Project</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* EDUCATION SECTION */}
          {hasEducation && (
            <section className="space-y-6">
              <h2
                className="text-sm font-bold uppercase tracking-wider border-b pb-2 flex items-center gap-2"
                style={{ color: primaryColor, borderColor: `${primaryColor}30` }}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Education & Qualifications</span>
              </h2>

              <div className="space-y-4">
                {education.map((edu) => {
                  const startStr = formatEducationDate(edu.startDate);
                  const endStr = edu.current
                    ? "Present"
                    : formatEducationDate(edu.endDate);
                  const dateRange = `${startStr} — ${endStr}`;
                  const degreeLabel = getDegreeLabel(edu.degree, edu.customDegree);
                  const fieldLabel = getFieldOfStudyLabel(edu.fieldOfStudy, edu.customFieldOfStudy);

                  return (
                    <div
                      key={edu.id}
                      className={`p-4 ${cardRadiusClass} border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isLight
                          ? "bg-slate-50 border-slate-200"
                          : "bg-slate-900/60 border-slate-800/80"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <h3 className="text-sm font-bold">
                          {degreeLabel} {fieldLabel ? `— ${fieldLabel}` : ""}
                        </h3>
                        <p className="text-xs font-semibold opacity-80">
                          {edu.institution} {edu.location ? `(${edu.location})` : ""}
                        </p>
                        {edu.grade && (
                          <p
                            className="text-xs font-medium flex items-center gap-1 pt-0.5"
                            style={{ color: primaryColor }}
                          >
                            <Award className="w-3 h-3" />
                            <span>Grade: {edu.grade}</span>
                          </p>
                        )}
                      </div>

                      <span className="text-xs font-mono opacity-70 shrink-0 font-medium">
                        {dateRange}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* CONTACT FOOTER SECTION */}
          {hasContact && (
            <section
              id="contact"
              className={`pt-6 border-t text-center space-y-4 ${
                isLight ? "border-slate-200" : "border-slate-800/80"
              }`}
            >
              <h2 className="text-sm font-bold uppercase tracking-wider">
                Contact & Inquiries
              </h2>
              <ContactForm username={username} customization={customization} />
            </section>
          )}
        </div>

        {/* FOOTER */}
        <footer
          className={`p-6 border-t text-center text-xs opacity-70 ${
            isLight
              ? "bg-slate-50 border-slate-200"
              : "bg-slate-900/80 border-slate-800"
          }`}
        >
          <p>
            © {new Date().getFullYear()} {displayName} · Generated via{" "}
            <Link
              href="/"
              className="font-medium hover:underline"
              style={{ color: primaryColor }}
            >
              MyFolio Executive
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
