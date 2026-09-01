import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  User as UserIcon,
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Globe,
  Mail,
  Phone,
  Briefcase,
  Building2,
  FolderGit2,
  Star,
  Wrench,
  GraduationCap,
  Award,
} from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/SocialIcons";
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

interface PublicPortfolioPageProps {
  params: Promise<{
    username: string;
  }>;
}

// Dynamic SEO Metadata
export async function generateMetadata({
  params,
}: PublicPortfolioPageProps): Promise<Metadata> {
  const { username } = await params;
  const normalizedUsername = username.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { username: normalizedUsername },
    include: { profile: true },
  });

  if (!user) {
    return {
      title: "Portfolio Not Found | MyFolio",
      description: "The requested portfolio does not exist on MyFolio.",
    };
  }

  const name = user.profile?.fullName || user.name || user.username || username;
  const headline = user.profile?.headline ? ` | ${user.profile.headline}` : " | MyFolio";
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

  // Query PostgreSQL database for user and profile
  const user = await prisma.user.findUnique({
    where: { username: normalizedUsername },
    select: {
      id: true,
      name: true,
      username: true,
      createdAt: true,
      profile: true,
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

  const profile = user.profile;
  const displayName = profile?.fullName || user.name || user.username || username;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="max-w-2xl w-full glass-card p-8 sm:p-12 rounded-3xl border border-slate-800 shadow-2xl text-center space-y-8 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-indigo-600/20 blur-3xl rounded-full pointer-events-none" />

        {/* User Badge / Photo Placeholder */}
        <div className="mx-auto w-24 h-24 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-xl shadow-indigo-500/20">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-indigo-400">
            <UserIcon className="w-12 h-12" />
          </div>
        </div>

        {/* Main Required Public Display */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verified Portfolio</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight uppercase">
            {displayName}
          </h1>

          {profile?.headline ? (
            <p className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center justify-center gap-1.5">
              <Briefcase className="w-5 h-5 text-purple-400" />
              <span>{profile.headline}</span>
            </p>
          ) : null}

          {profile?.bio ? (
            <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed pt-1">
              {profile.bio}
            </p>
          ) : null}

          {profile?.location ? (
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5 pt-1">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>{profile.location}</span>
            </p>
          ) : null}
        </div>

        {/* Social Links & Web Links */}
        {(profile?.website || profile?.github || profile?.linkedin) && (
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-200 hover:text-white transition-colors"
              >
                <Globe className="w-4 h-4 text-indigo-400" />
                <span>Website</span>
              </a>
            )}

            {profile.github && (
              <a
                href={profile.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-200 hover:text-white transition-colors"
              >
                <GithubIcon className="w-4 h-4 text-slate-300" />
                <span>GitHub</span>
              </a>
            )}

            {profile.linkedin && (
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-200 hover:text-white transition-colors"
              >
                <LinkedinIcon className="w-4 h-4 text-blue-400" />
                <span>LinkedIn</span>
              </a>
            )}
          </div>
        )}

        {/* Projects Section */}
        {user.projects && user.projects.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-slate-800/80 text-left">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center justify-center gap-2 mb-4">
              <FolderGit2 className="w-4 h-4 text-indigo-400" />
              <span>Projects Showcase</span>
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {user.projects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-lg relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-bold text-white tracking-tight">
                      {proj.title}
                    </h3>
                    {proj.featured && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>Featured</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {proj.description}
                  </p>

                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {proj.technologies.map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-950 text-indigo-300 border border-slate-800 text-[11px] font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  {(proj.liveUrl || proj.githubUrl) && (
                    <div className="flex items-center gap-3 pt-2 text-xs">
                      {proj.liveUrl && (
                        <a
                          href={proj.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span>Live Demo</span>
                        </a>
                      )}
                      {proj.githubUrl && (
                        <a
                          href={proj.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-slate-300 hover:text-white font-medium"
                        >
                          <GithubIcon className="w-3.5 h-3.5" />
                          <span>GitHub</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills Section */}
        {user.skills && user.skills.length > 0 && (
          <div className="space-y-6 pt-6 border-t border-slate-800/80 text-left">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center justify-center gap-2 mb-4">
              <Wrench className="w-4 h-4 text-indigo-400" />
              <span>Skills & Expertise</span>
            </h2>

            {/* Categorized Skills rendering */}
            {(() => {
              // Group skills by category
              const groupedSkills: Record<string, typeof user.skills> = {};
              user.skills.forEach((s) => {
                const cat = s.category && s.category.trim() ? s.category.trim() : "Technical Skills";
                if (!groupedSkills[cat]) {
                  groupedSkills[cat] = [];
                }
                groupedSkills[cat].push(s);
              });

              const profMap: Record<string, { label: string; width: string; color: string }> = {
                BEGINNER: { label: "Beginner", width: "w-1/4", color: "bg-blue-400" },
                INTERMEDIATE: { label: "Intermediate", width: "w-1/2", color: "bg-indigo-400" },
                ADVANCED: { label: "Advanced", width: "w-3/4", color: "bg-purple-400" },
                EXPERT: { label: "Expert", width: "w-full", color: "bg-gradient-to-r from-amber-400 to-emerald-400" },
              };

              return (
                <div className="space-y-6">
                  {Object.entries(groupedSkills).map(([categoryName, categorySkills]) => (
                    <div key={categoryName} className="space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          {categoryName}
                        </h3>
                        <div className="flex-1 h-px bg-slate-800" />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {categorySkills.map((skill) => {
                          const info = profMap[skill.proficiency] || profMap.INTERMEDIATE;
                          return (
                            <div
                              key={skill.id}
                              className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2"
                            >
                              <div className="flex items-center justify-between text-xs font-medium">
                                <span className="text-white font-semibold">{skill.name}</span>
                                <span className="text-slate-400 text-[11px]">{info.label}</span>
                              </div>

                              <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                                <div className={`h-full ${info.width} ${info.color} rounded-full transition-all`} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* Experience Section - Professional Timeline */}
        {user.experience && user.experience.length > 0 && (
          <div className="space-y-6 pt-6 border-t border-slate-800/80 text-left">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center justify-center gap-2 mb-6">
              <Briefcase className="w-4 h-4 text-indigo-400" />
              <span>Work Experience</span>
            </h2>

            <div className="relative border-l-2 border-slate-800 ml-3 sm:ml-6 pl-6 sm:pl-8 space-y-8">
              {user.experience.map((exp) => {
                const empLabel =
                  EMPLOYMENT_TYPE_LABELS[exp.employmentType as EmploymentTypeEnum] ||
                  exp.employmentType;
                const startStr = formatExperienceDate(exp.startDate.toISOString());
                const endStr = exp.current
                  ? "Present"
                  : formatExperienceDate(exp.endDate ? exp.endDate.toISOString() : null);
                const dateRange = `${startStr} — ${endStr}`;

                return (
                  <div key={exp.id} className="relative group">
                    {/* Timeline dot */}
                    <div
                      className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full border-2 ${
                        exp.current
                          ? "bg-emerald-500 border-emerald-400 shadow-md shadow-emerald-500/50 animate-pulse"
                          : "bg-slate-900 border-indigo-500"
                      }`}
                    />

                    <div className="p-5 rounded-2xl glass-card border border-slate-800 space-y-3 shadow-lg hover:border-slate-700/80 transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 border-b border-slate-800/60 pb-3">
                        <div>
                          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                            {exp.position}
                          </h3>
                          <p className="text-sm font-semibold text-indigo-300 flex items-center gap-1.5 mt-0.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{exp.company}</span>
                          </p>
                        </div>

                        <div className="text-xs font-mono text-slate-300 bg-slate-900/90 px-3 py-1 rounded-lg border border-slate-800 shrink-0 self-start sm:self-auto font-medium">
                          {dateRange}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-semibold">
                          {empLabel}
                        </span>

                        {exp.current && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
                            Current Role
                          </span>
                        )}

                        {exp.location && (
                          <span className="text-slate-400 flex items-center gap-1 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            <span>{exp.location}</span>
                          </span>
                        )}
                      </div>

                      {exp.description && (
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1 whitespace-pre-line">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Education Section - Timeline */}
        {user.education && user.education.length > 0 && (
          <div className="space-y-6 pt-6 border-t border-slate-800/80 text-left">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center justify-center gap-2 mb-6">
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              <span>Education</span>
            </h2>

            <div className="relative border-l-2 border-slate-800 ml-3 sm:ml-6 pl-6 sm:pl-8 space-y-8">
              {user.education.map((edu) => {
                const startStr = formatEducationDate(edu.startDate.toISOString());
                const endStr = edu.current
                  ? "Present"
                  : formatEducationDate(edu.endDate ? edu.endDate.toISOString() : null);
                const dateRange = `${startStr} — ${endStr}`;
                const degreeLabel = getDegreeLabel(edu.degree, edu.customDegree);
                const fieldLabel = getFieldOfStudyLabel(edu.fieldOfStudy, edu.customFieldOfStudy);

                return (
                  <div key={edu.id} className="relative group">
                    {/* Timeline dot */}
                    <div
                      className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full border-2 ${
                        edu.current
                          ? "bg-purple-500 border-purple-400 shadow-md shadow-purple-500/50 animate-pulse"
                          : "bg-slate-900 border-indigo-500"
                      }`}
                    />

                    <div className="p-5 rounded-2xl glass-card border border-slate-800 space-y-3 shadow-lg hover:border-slate-700/80 transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 border-b border-slate-800/60 pb-3">
                        <div>
                          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                            <span>{degreeLabel}</span>
                          </h3>
                          {fieldLabel && (
                            <p className="text-xs font-semibold text-purple-300 mt-0.5">
                              {fieldLabel}
                            </p>
                          )}
                          <p className="text-sm font-semibold text-slate-300 flex items-center gap-1.5 mt-1">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{edu.institution}</span>
                          </p>
                        </div>

                        <div className="text-xs font-mono text-slate-300 bg-slate-900/90 px-3 py-1 rounded-lg border border-slate-800 shrink-0 self-start sm:self-auto font-medium">
                          {dateRange}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        {edu.current && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
                            Currently Studying
                          </span>
                        )}

                        {edu.location && (
                          <span className="text-slate-400 flex items-center gap-1 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            <span>{edu.location}</span>
                          </span>
                        )}

                        {edu.grade && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-semibold">
                            <Award className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <span>Grade: {edu.grade}</span>
                          </span>
                        )}
                      </div>

                      {edu.description && (
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1 whitespace-pre-line">
                          {edu.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Explicitly Enabled Public Contact Options */}
        {((profile?.showEmail && profile?.email) || (profile?.showPhone && profile?.phone)) && (
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex flex-col sm:flex-row items-center justify-center gap-4">
            {profile.showEmail && profile.email && (
              <a
                href={`mailto:${profile.email}`}
                className="inline-flex items-center gap-1.5 text-indigo-300 hover:underline"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{profile.email}</span>
              </a>
            )}

            {profile.showPhone && profile.phone && (
              <a
                href={`tel:${profile.phone}`}
                className="inline-flex items-center gap-1.5 text-emerald-300 hover:underline"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{profile.phone}</span>
              </a>
            )}
          </div>
        )}

        {/* Action Link */}
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to MyFolio</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
