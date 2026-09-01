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
import { PortfolioData } from "@/types/portfolio";
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

interface ProfessionalTemplateProps {
  portfolioData: PortfolioData;
}

export default function ProfessionalTemplate({
  portfolioData,
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

  const hasExperience = experience.length > 0;
  const hasSkills = skills.length > 0;
  const hasProjects = projects.length > 0;
  const hasEducation = education.length > 0;
  const hasContact = Boolean(
    profile?.website ||
      profile?.github ||
      profile?.linkedin ||
      profile?.twitter ||
      (profile?.showEmail && profile?.email) ||
      (profile?.showPhone && profile?.phone)
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-blue-600 selection:text-white py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      {/* Executive Resume Container */}
      <div className="max-w-4xl mx-auto bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
        {/* EXECUTIVE HEADER */}
        <header className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-8 sm:p-10 border-b border-slate-800 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              {profile?.profileImage ? (
                <img
                  src={profile.profileImage}
                  alt={displayName}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-xl shrink-0"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-indigo-950 border-2 border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-2xl shrink-0">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="space-y-1.5">
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {displayName}
                </h1>
                {profile?.headline && (
                  <p className="text-sm sm:text-lg font-semibold text-indigo-400">
                    {profile.headline}
                  </p>
                )}
                {profile?.location && (
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>{profile.location}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Contact & Social Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-800/80 text-xs">
            {profile?.showEmail && profile?.email && (
              <a
                href={`mailto:${profile.email}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>{profile.email}</span>
              </a>
            )}

            {profile?.showPhone && profile?.phone && (
              <a
                href={`tel:${profile.phone}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-indigo-400" />
                <span>{profile.phone}</span>
              </a>
            )}

            {profile?.website && (
              <a
                href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                <span>Website</span>
              </a>
            )}

            {profile?.linkedin && (
              <a
                href={profile.linkedin.startsWith("http") ? profile.linkedin : `https://linkedin.com/in/${profile.linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
              >
                <LinkedinIcon className="w-3.5 h-3.5 text-sky-400" />
                <span>LinkedIn</span>
              </a>
            )}

            {profile?.github && (
              <a
                href={profile.github.startsWith("http") ? profile.github : `https://github.com/${profile.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
              >
                <GithubIcon className="w-3.5 h-3.5 text-slate-300" />
                <span>GitHub</span>
              </a>
            )}
          </div>
        </header>

        {/* RESUME BODY */}
        <div className="p-8 sm:p-10 space-y-10">
          {/* PROFESSIONAL SUMMARY */}
          {profile?.bio && (
            <section className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-400 border-b border-indigo-500/20 pb-2">
                Executive Summary
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {profile.bio}
              </p>
            </section>
          )}

          {/* WORK EXPERIENCE (PRIORITIZED FIRST FOR PROFESSIONAL TEMPLATE) */}
          {hasExperience && (
            <section className="space-y-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-400 border-b border-indigo-500/20 pb-2 flex items-center gap-2">
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
                      className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-800/60 pb-2">
                        <div>
                          <h3 className="text-base font-bold text-white">
                            {exp.position}
                          </h3>
                          <p className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mt-0.5">
                            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{exp.company}</span>
                            {exp.location && (
                              <span className="text-slate-400 font-normal">
                                · {exp.location}
                              </span>
                            )}
                          </p>
                        </div>

                        <div className="text-xs font-mono text-indigo-300 font-semibold shrink-0">
                          {dateRange} ({empLabel})
                        </div>
                      </div>

                      {exp.description && (
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
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
              <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-400 border-b border-indigo-500/20 pb-2">
                Core Competencies & Skills
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(skillsByCategory).map(([category, catSkills]) => (
                  <div
                    key={category}
                    className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2"
                  >
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      {category}
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {catSkills.map((skill) => (
                        <span
                          key={skill.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-xs font-medium text-slate-200"
                        >
                          <CheckCircle2 className="w-3 h-3 text-indigo-400" />
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
              <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-400 border-b border-indigo-500/20 pb-2 flex items-center gap-2">
                <FolderGit2 className="w-4 h-4" />
                <span>Key Projects & Portfolio</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <h3 className="text-sm font-bold text-white">
                        {project.title}
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                        {project.description}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-800/60">
                      {project.technologies && project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 text-[10px] font-mono text-slate-400">
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
                            className="text-slate-400 hover:text-white font-medium"
                          >
                            GitHub
                          </a>
                        )}
                        {project.liveUrl && (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-0.5"
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
              <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-400 border-b border-indigo-500/20 pb-2 flex items-center gap-2">
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
                      className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <h3 className="text-sm font-bold text-white">
                          {degreeLabel} {fieldLabel ? `— ${fieldLabel}` : ""}
                        </h3>
                        <p className="text-xs font-semibold text-slate-300">
                          {edu.institution} {edu.location ? `(${edu.location})` : ""}
                        </p>
                        {edu.grade && (
                          <p className="text-xs text-indigo-400 font-medium flex items-center gap-1 pt-0.5">
                            <Award className="w-3 h-3" />
                            <span>Grade: {edu.grade}</span>
                          </p>
                        )}
                      </div>

                      <span className="text-xs font-mono text-slate-400 shrink-0 font-medium">
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
            <section id="contact" className="pt-6 border-t border-slate-800/80 text-center space-y-2">
              <p className="text-xs font-semibold text-slate-400">
                Interested in working together?
              </p>
              {profile?.showEmail && profile?.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className="inline-block text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  {profile.email}
                </a>
              )}
            </section>
          )}
        </div>

        {/* FOOTER */}
        <footer className="bg-slate-900/80 p-6 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} {displayName} · Generated via{" "}
            <Link href="/" className="text-indigo-400 hover:text-indigo-300 font-medium">
              MyFolio Executive
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
