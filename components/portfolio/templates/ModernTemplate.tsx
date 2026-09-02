"use client";

import Link from "next/link";
import {
  User as UserIcon,
  MapPin,
  Globe,
  Mail,
  Phone,
  Briefcase,
  Building2,
  FolderGit2,
  ExternalLink,
  Star,
  Wrench,
  GraduationCap,
  Award,
} from "lucide-react";
import { GithubIcon, LinkedinIcon, TwitterIcon } from "@/components/SocialIcons";
import {
  PortfolioData,
  PortfolioCustomization,
  getProficiencyPercentage,
  getProficiencyLabel,
} from "@/types/portfolio";
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

interface ModernTemplateProps {
  portfolioData: PortfolioData;
  customization?: PortfolioCustomization;
}

export default function ModernTemplate({
  portfolioData,
  customization = DEFAULT_CUSTOMIZATION,
}: ModernTemplateProps) {
  const { profile, projects, skills, experience, education, username, name } = portfolioData;

  const displayName = profile?.fullName || name || username;

  // Group skills by category
  const skillsByCategory = skills.reduce<Record<string, typeof skills>>((acc, skill) => {
    const cat = skill.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  const buttonClass = getButtonStyleClass(customization.buttonStyle);
  const cardRadiusClass = getBorderRadiusClass(customization.borderRadius);
  const primaryColor = customization.themeColor;
  const isLight = customization.themeMode === "LIGHT";

  const hasAbout = customization.showAbout;
  const hasSkills = customization.showSkills && skills.length > 0;
  const hasProjects = customization.showProjects && projects.length > 0;
  const hasExperience = customization.showExperience && experience.length > 0;
  const hasEducation = customization.showEducation && education.length > 0;
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
      className={`min-h-screen font-sans relative overflow-x-hidden ${
        isLight ? "bg-slate-50 text-slate-900" : "bg-slate-950 text-slate-100"
      }`}
    >
      {/* Background Glows */}
      {!isLight && (
        <>
          <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-indigo-600/15 via-purple-600/10 to-transparent blur-[120px] pointer-events-none rounded-full" />
          <div className="fixed bottom-0 right-0 w-[600px] h-[400px] bg-gradient-to-bl from-blue-600/10 via-purple-600/10 to-transparent blur-[120px] pointer-events-none rounded-full" />
        </>
      )}

      {/* Header Navigation */}
      <header
        className={`sticky top-0 z-40 backdrop-blur-xl border-b ${
          isLight
            ? "bg-white/80 border-slate-200"
            : "bg-slate-950/80 border-slate-800/80"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href={`/${username}`}
            className="text-base font-bold tracking-tight flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <div
              className={`w-8 h-8 ${cardRadiusClass} flex items-center justify-center text-white text-xs font-black shadow-md`}
              style={{ backgroundColor: primaryColor }}
            >
              {displayName.charAt(0).toUpperCase()}
            </div>
            <span className="truncate max-w-[180px] sm:max-w-xs">{displayName}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold">
            {hasAbout && profile?.bio && (
              <a href="#about" className="hover:opacity-80 transition-opacity">
                About
              </a>
            )}
            {hasSkills && (
              <a href="#skills" className="hover:opacity-80 transition-opacity">
                Skills
              </a>
            )}
            {hasProjects && (
              <a href="#projects" className="hover:opacity-80 transition-opacity">
                Projects
              </a>
            )}
            {hasExperience && (
              <a href="#experience" className="hover:opacity-80 transition-opacity">
                Experience
              </a>
            )}
            {hasEducation && (
              <a href="#education" className="hover:opacity-80 transition-opacity">
                Education
              </a>
            )}
            {hasContact && (
              <a href="#contact" className="hover:opacity-80 transition-opacity">
                Contact
              </a>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16 relative z-10">
        {/* HERO / ABOUT SECTION */}
        {hasAbout && (
          <section id="about" className="text-center space-y-6">
            <div className="inline-block relative">
              <div
                className="absolute -inset-1 rounded-full blur opacity-40 animate-pulse"
                style={{ backgroundColor: primaryColor }}
              />
              <div
                className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 mx-auto flex items-center justify-center shadow-2xl ${
                  isLight
                    ? "border-slate-200 bg-white"
                    : "border-slate-800 bg-slate-900"
                }`}
              >
                {profile?.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-14 h-14 opacity-50" />
                )}
              </div>
            </div>

            <div className="space-y-3 max-w-2xl mx-auto">
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                {displayName}
              </h1>

              {profile?.headline && (
                <p
                  className="text-lg sm:text-xl font-semibold"
                  style={{ color: primaryColor }}
                >
                  {profile.headline}
                </p>
              )}

              {profile?.location && (
                <div className="flex items-center justify-center gap-1.5 text-xs opacity-75 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{profile.location}</span>
                </div>
              )}

              {profile?.bio && (
                <p className="text-sm sm:text-base leading-relaxed font-normal pt-2 opacity-90">
                  {profile.bio}
                </p>
              )}
            </div>

            {/* Social Links Bar */}
            {hasSocial && (
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {profile?.website && (
                  <a
                    href={
                      profile.website.startsWith("http")
                        ? profile.website
                        : `https://${profile.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 border text-xs font-semibold ${buttonClass} ${
                      isLight
                        ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                        : "bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700"
                    } transition-all shadow-sm`}
                  >
                    <Globe className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                    <span>Website</span>
                  </a>
                )}

                {profile?.github && (
                  <a
                    href={
                      profile.github.startsWith("http")
                        ? profile.github
                        : `https://github.com/${profile.github}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 border text-xs font-semibold ${buttonClass} ${
                      isLight
                        ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                        : "bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700"
                    } transition-all shadow-sm`}
                  >
                    <GithubIcon className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                  </a>
                )}

                {profile?.linkedin && (
                  <a
                    href={
                      profile.linkedin.startsWith("http")
                        ? profile.linkedin
                        : `https://linkedin.com/in/${profile.linkedin}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 border text-xs font-semibold ${buttonClass} ${
                      isLight
                        ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                        : "bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700"
                    } transition-all shadow-sm`}
                  >
                    <LinkedinIcon className="w-3.5 h-3.5 text-sky-500" />
                    <span>LinkedIn</span>
                  </a>
                )}

                {profile?.twitter && (
                  <a
                    href={
                      profile.twitter.startsWith("http")
                        ? profile.twitter
                        : `https://twitter.com/${profile.twitter}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 border text-xs font-semibold ${buttonClass} ${
                      isLight
                        ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                        : "bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700"
                    } transition-all shadow-sm`}
                  >
                    <TwitterIcon className="w-3.5 h-3.5 text-sky-400" />
                    <span>Twitter</span>
                  </a>
                )}
              </div>
            )}
          </section>
        )}

        {/* SKILLS SECTION */}
        {hasSkills && (
          <section
            id="skills"
            className={`space-y-6 pt-6 border-t ${
              isLight ? "border-slate-200" : "border-slate-800/80"
            }`}
          >
            <h2 className="text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 mb-6">
              <Wrench className="w-4 h-4" style={{ color: primaryColor }} />
              <span>Skills & Expertise</span>
            </h2>

            <div className="space-y-6">
              {Object.entries(skillsByCategory).map(([category, catSkills]) => (
                <div key={category} className="space-y-3">
                  <h3 className="text-xs font-semibold opacity-70 uppercase tracking-wider pl-1">
                    {category}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {catSkills.map((skill) => (
                      <div
                        key={skill.id}
                        className={`p-3.5 ${cardRadiusClass} border flex items-center justify-between gap-3 shadow-md ${
                          isLight
                            ? "bg-white border-slate-200"
                            : "bg-slate-900/80 border-slate-800/90"
                        }`}
                      >
                        <span className="text-xs font-semibold truncate">
                          {skill.name}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <div
                            className={`w-20 ${cardRadiusClass} h-1.5 overflow-hidden ${
                              isLight ? "bg-slate-200" : "bg-slate-800"
                            }`}
                          >
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${getProficiencyPercentage(skill.proficiency)}%`,
                                backgroundColor: primaryColor,
                              }}
                            />
                          </div>
                          <span className="text-[10px] font-mono font-medium opacity-70 w-16 text-right truncate">
                            {getProficiencyLabel(skill.proficiency)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* PROJECTS SECTION */}
        {hasProjects && (
          <section
            id="projects"
            className={`space-y-6 pt-6 border-t ${
              isLight ? "border-slate-200" : "border-slate-800/80"
            }`}
          >
            <h2 className="text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 mb-6">
              <FolderGit2 className="w-4 h-4" style={{ color: primaryColor }} />
              <span>Featured Projects</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className={`${cardRadiusClass} border overflow-hidden flex flex-col justify-between shadow-xl transition-all ${
                    isLight
                      ? "bg-white border-slate-200"
                      : "bg-slate-900/90 border-slate-800"
                  }`}
                >
                  <div className="space-y-4 p-5">
                    {project.image && (
                      <div className={`aspect-video ${cardRadiusClass} overflow-hidden bg-slate-950 relative border border-slate-800`}>
                        <img
                          src={project.image}
                          alt={project.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-bold tracking-tight">
                          {project.title}
                        </h3>
                        {project.featured && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-semibold shrink-0">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>Featured</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs opacity-80 leading-relaxed line-clamp-3">
                        {project.description}
                      </p>
                    </div>

                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {project.technologies.map((tech, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 ${buttonClass} border text-[10px] font-medium ${
                              isLight
                                ? "bg-slate-100 border-slate-200 text-slate-700"
                                : "bg-slate-950 border-slate-800 text-slate-300"
                            }`}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div
                    className={`p-4 border-t flex items-center justify-end gap-3 text-xs ${
                      isLight
                        ? "bg-slate-50 border-slate-200"
                        : "bg-slate-950/60 border-slate-800/80"
                    }`}
                  >
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View ${project.title} source code on GitHub`}
                        className="inline-flex items-center gap-1 opacity-70 hover:opacity-100 font-medium transition-opacity"
                      >
                        <GithubIcon className="w-3.5 h-3.5" />
                        <span>Code</span>
                      </a>
                    )}
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View ${project.title} live demo website`}
                        className="inline-flex items-center gap-1 font-semibold transition-opacity"
                        style={{ color: primaryColor }}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Live Demo</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* EXPERIENCE SECTION */}
        {hasExperience && (
          <section
            id="experience"
            className={`space-y-6 pt-6 border-t text-left ${
              isLight ? "border-slate-200" : "border-slate-800/80"
            }`}
          >
            <h2 className="text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 mb-6">
              <Briefcase className="w-4 h-4" style={{ color: primaryColor }} />
              <span>Work Experience</span>
            </h2>

            <div className={`relative border-l-2 ml-3 sm:ml-6 pl-6 sm:pl-8 space-y-8 ${isLight ? "border-slate-300" : "border-slate-800"}`}>
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
                  <div key={exp.id} className="relative group">
                    <div
                      className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-md"
                      style={{ backgroundColor: primaryColor }}
                    />

                    <div
                      className={`p-5 ${cardRadiusClass} border space-y-3 shadow-lg ${
                        isLight
                          ? "bg-white border-slate-200"
                          : "bg-slate-900/80 border-slate-800"
                      }`}
                    >
                      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 border-b pb-3 ${isLight ? "border-slate-200" : "border-slate-800/60"}`}>
                        <div>
                          <h3 className="text-base sm:text-lg font-bold tracking-tight">
                            {exp.position}
                          </h3>
                          <p
                            className="text-sm font-semibold flex items-center gap-1.5 mt-0.5"
                            style={{ color: primaryColor }}
                          >
                            <Building2 className="w-3.5 h-3.5 opacity-60 shrink-0" />
                            <span>{exp.company}</span>
                          </p>
                        </div>

                        <div className={`text-xs font-mono px-3 py-1 ${buttonClass} border shrink-0 font-medium ${isLight ? "bg-slate-100 border-slate-200" : "bg-slate-900 border-slate-800"}`}>
                          {dateRange}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span
                          className={`px-2.5 py-0.5 rounded-full border text-xs font-semibold`}
                          style={{
                            backgroundColor: `${primaryColor}15`,
                            borderColor: `${primaryColor}30`,
                            color: primaryColor,
                          }}
                        >
                          {empLabel}
                        </span>

                        {exp.current && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-semibold">
                            Current Role
                          </span>
                        )}

                        {exp.location && (
                          <span className="opacity-75 flex items-center gap-1 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span>{exp.location}</span>
                          </span>
                        )}
                      </div>

                      {exp.description && (
                        <p className="text-xs sm:text-sm opacity-90 leading-relaxed pt-1 whitespace-pre-line">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* EDUCATION SECTION */}
        {hasEducation && (
          <section
            id="education"
            className={`space-y-6 pt-6 border-t text-left ${
              isLight ? "border-slate-200" : "border-slate-800/80"
            }`}
          >
            <h2 className="text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 mb-6">
              <GraduationCap className="w-4 h-4" style={{ color: primaryColor }} />
              <span>Education</span>
            </h2>

            <div className={`relative border-l-2 ml-3 sm:ml-6 pl-6 sm:pl-8 space-y-8 ${isLight ? "border-slate-300" : "border-slate-800"}`}>
              {education.map((edu) => {
                const startStr = formatEducationDate(edu.startDate);
                const endStr = edu.current
                  ? "Present"
                  : formatEducationDate(edu.endDate);
                const dateRange = `${startStr} — ${endStr}`;
                const degreeLabel = getDegreeLabel(edu.degree, edu.customDegree);
                const fieldLabel = getFieldOfStudyLabel(edu.fieldOfStudy, edu.customFieldOfStudy);

                return (
                  <div key={edu.id} className="relative group">
                    <div
                      className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-md"
                      style={{ backgroundColor: primaryColor }}
                    />

                    <div
                      className={`p-5 ${cardRadiusClass} border space-y-3 shadow-lg ${
                        isLight
                          ? "bg-white border-slate-200"
                          : "bg-slate-900/80 border-slate-800"
                      }`}
                    >
                      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 border-b pb-3 ${isLight ? "border-slate-200" : "border-slate-800/60"}`}>
                        <div>
                          <h3 className="text-base sm:text-lg font-bold tracking-tight">
                            {degreeLabel}
                          </h3>
                          {fieldLabel && (
                            <p
                              className="text-xs font-semibold mt-0.5"
                              style={{ color: primaryColor }}
                            >
                              {fieldLabel}
                            </p>
                          )}
                          <p className="text-sm font-semibold flex items-center gap-1.5 mt-1 opacity-80">
                            <Building2 className="w-3.5 h-3.5 opacity-60 shrink-0" />
                            <span>{edu.institution}</span>
                          </p>
                        </div>

                        <div className={`text-xs font-mono px-3 py-1 ${buttonClass} border shrink-0 font-medium ${isLight ? "bg-slate-100 border-slate-200" : "bg-slate-900 border-slate-800"}`}>
                          {dateRange}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        {edu.current && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-semibold">
                            Currently Studying
                          </span>
                        )}

                        {edu.location && (
                          <span className="opacity-75 flex items-center gap-1 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span>{edu.location}</span>
                          </span>
                        )}

                        {edu.grade && (
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-semibold"
                            style={{
                              backgroundColor: `${primaryColor}15`,
                              borderColor: `${primaryColor}30`,
                              color: primaryColor,
                            }}
                          >
                            <Award className="w-3.5 h-3.5 shrink-0" />
                            <span>Grade: {edu.grade}</span>
                          </span>
                        )}
                      </div>

                      {edu.description && (
                        <p className="text-xs sm:text-sm opacity-90 leading-relaxed pt-1 whitespace-pre-line">
                          {edu.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* CONTACT SECTION */}
        {hasContact && (
          <section
            id="contact"
            className={`space-y-6 pt-6 border-t text-center ${
              isLight ? "border-slate-200" : "border-slate-800/80"
            }`}
          >
            <h2 className="text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 mb-3">
              <Mail className="w-4 h-4" style={{ color: primaryColor }} />
              <span>Get In Touch</span>
            </h2>

            <div
              className={`p-6 ${cardRadiusClass} border space-y-4 max-w-md mx-auto shadow-xl ${
                isLight
                  ? "bg-white border-slate-200"
                  : "bg-slate-900/90 border-slate-800"
              }`}
            >
              <p className="text-xs sm:text-sm opacity-90 leading-relaxed">
                Feel free to reach out for collaborations, job opportunities, or questions.
              </p>

              <div className="flex flex-col gap-2.5 pt-2">
                {profile?.showEmail && profile?.email && (
                  <a
                    href={`mailto:${profile.email}`}
                    className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 ${buttonClass} text-white font-semibold text-xs transition-all shadow-md`}
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Mail className="w-4 h-4" />
                    <span>{profile.email}</span>
                  </a>
                )}

                {profile?.showPhone && profile?.phone && (
                  <a
                    href={`tel:${profile.phone}`}
                    className={`inline-flex items-center justify-center gap-2 px-4 py-2 ${buttonClass} border font-semibold text-xs transition-colors ${
                      isLight
                        ? "bg-slate-100 border-slate-200 text-slate-800"
                        : "bg-slate-900 border-slate-800 text-slate-200"
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                    <span>{profile.phone}</span>
                  </a>
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer
        className={`border-t py-8 text-center text-xs opacity-75 ${
          isLight
            ? "border-slate-200 bg-white text-slate-600"
            : "border-slate-800/80 bg-slate-950 text-slate-400"
        }`}
      >
        <p>
          © {new Date().getFullYear()} {displayName}. Powered by{" "}
          <Link
            href="/"
            className="font-semibold hover:underline"
            style={{ color: primaryColor }}
          >
            MyFolio
          </Link>
        </p>
      </footer>
    </div>
  );
}
