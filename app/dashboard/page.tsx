import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LogoutButton from "@/components/LogoutButton";
import PublishingStatus from "@/components/portfolio/PublishingStatus";
import {
  LayoutDashboard,
  ExternalLink,
  Edit3,
  ShieldCheck,
  Globe,
  User as UserIcon,
  MapPin,
  Briefcase,
  CheckCircle2,
  Circle,
  PlusCircle,
  FolderGit2,
  Star,
  Wrench,
  GraduationCap,
} from "lucide-react";
import { getDegreeLabel } from "@/lib/constants/education-options";

export default async function DashboardPage() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  // Fetch user, profile, and project stats from PostgreSQL
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: true,
      projects: {
        select: { id: true, featured: true },
      },
      skills: {
        select: { id: true, name: true, proficiency: true },
        orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
      },
      experience: {
        select: { id: true, position: true, company: true, current: true },
        orderBy: [{ current: "desc" }, { displayOrder: "asc" }, { startDate: "desc" }],
      },
      education: {
        select: { id: true, degree: true, customDegree: true, institution: true, current: true },
        orderBy: [{ current: "desc" }, { displayOrder: "asc" }, { startDate: "desc" }],
      },
      portfolioSettings: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  if (!user.username) {
    redirect("/username");
  }

  const profile = user.profile;
  const displayName = profile?.fullName || user.name || user.username;
  const userUsername = user.username;

  // Calculate dynamic profile completion percentage
  const completionItems = [
    { label: "Profile details", completed: Boolean(profile?.fullName && profile?.headline) },
    { label: "Projects added", completed: (user?.projects?.length || 0) > 0 },
    { label: "Skills added", completed: (user?.skills?.length || 0) > 0 },
    { label: "Experience added", completed: (user?.experience?.length || 0) > 0 },
    { label: "Education added", completed: (user?.education?.length || 0) > 0 },
    {
      label: "Contact & Links",
      completed: Boolean(profile?.website || profile?.github || profile?.linkedin || profile?.email),
    },
  ];

  const completedCount = completionItems.filter((item) => item.completed).length;
  const completionPercentage = Math.round(
    (completedCount / completionItems.length) * 100
  );

  return (
    <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold">
            <LayoutDashboard className="w-4 h-4" />
            <span>Developer Workspace</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Welcome, {displayName}
          </h1>
          <p className="text-sm text-slate-400">
            Manage your public portfolio URL, professional profile, and settings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/${userUsername}`}
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 transition-all active:scale-[0.98]"
          >
            <span>View Portfolio</span>
            <ExternalLink className="w-4 h-4" />
          </Link>

          <LogoutButton variant="outline" />
        </div>
      </div>

      {/* Publishing Status & Controls Card */}
      <PublishingStatus
        initialIsPublished={user.portfolioSettings?.isPublished ?? false}
        username={userUsername}
        readiness={[
          { label: "Username", completed: Boolean(user.username) },
          { label: "Profile", completed: Boolean(profile?.fullName && profile?.headline) },
          { label: "Projects", completed: (user?.projects?.length || 0) > 0, count: user?.projects?.length || 0, optional: true },
          { label: "Skills", completed: (user?.skills?.length || 0) > 0, count: user?.skills?.length || 0, optional: true },
          { label: "Experience", completed: (user?.experience?.length || 0) > 0, count: user?.experience?.length || 0, optional: true },
          { label: "Education", completed: (user?.education?.length || 0) > 0, count: user?.education?.length || 0, optional: true },
        ]}
      />

      {/* Main Grid: Profile Summary & Completion Tracker */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Summary Box (2 columns) */}
        <div className="md:col-span-2 glass-card p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-indigo-400" />
                <span>Professional Profile Summary</span>
              </h2>
              {profile ? (
                <Link
                  href="/dashboard/profile"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 hover:text-white text-xs font-semibold transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </Link>
              ) : null}
            </div>

            {profile ? (
              <div className="space-y-3">
                <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    {profile.fullName}
                  </h3>
                  {profile.headline ? (
                    <p className="text-sm font-medium text-indigo-300 flex items-center gap-1.5 mt-0.5">
                      <Briefcase className="w-4 h-4 text-slate-500" />
                      <span>{profile.headline}</span>
                    </p>
                  ) : null}
                </div>

                {profile.bio ? (
                  <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed">
                    {profile.bio}
                  </p>
                ) : null}

                {profile.location ? (
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span>{profile.location}</span>
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">
                    Create your profile
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Add your professional information to start building your portfolio.
                  </p>
                </div>
                <Link
                  href="/dashboard/profile"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create Profile</span>
                </Link>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Portfolio Handle: <code className="text-indigo-300 font-mono">/{userUsername}</code></span>
            {profile ? (
              <Link
                href="/dashboard/profile"
                className="text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Edit Profile →
              </Link>
            ) : null}
          </div>
        </div>

        {/* Profile Completion Card (1 column) */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-5 flex flex-col justify-between shadow-xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h3 className="text-sm font-semibold text-white">
                Profile completion
              </h3>
              <span className="text-sm font-bold text-indigo-400 font-mono">
                {completionPercentage}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 rounded-full"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>

            {/* Completion Checklist */}
            <div className="space-y-2.5 pt-2">
              {completionItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  {item.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                  )}
                  <span
                    className={
                      item.completed
                        ? "text-slate-200 font-medium"
                        : "text-slate-500"
                    }
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/dashboard/profile"
              className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              <span>{profile ? "Update Profile" : "Complete Profile"}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Projects Overview Card */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-indigo-400" />
            <span>Projects Showcase</span>
          </h2>
          <Link
            href="/dashboard/projects"
            className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Manage Projects →
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-950/90 border border-slate-800">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-2xl font-bold text-white tracking-tight">
                {user?.projects?.length || 0}
              </p>
              <p className="text-xs text-slate-400 font-medium">Total Projects</p>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <p className="text-2xl font-bold text-amber-400 tracking-tight flex items-center gap-1">
                <span>{user?.projects?.filter((p) => p.featured).length || 0}</span>
                <Star className="w-4 h-4 fill-amber-400" />
              </p>
              <p className="text-xs text-slate-400 font-medium">Featured Projects</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/projects/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-500/20"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Project</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Skills Summary Card */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Wrench className="w-4 h-4 text-indigo-400" />
            <span>Skills Overview</span>
          </h2>
          <Link
            href="/dashboard/skills"
            className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Manage Skills →
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-950/90 border border-slate-800">
          <div className="space-y-1">
            <p className="text-2xl font-bold text-white tracking-tight">
              {user?.skills?.length || 0} skills added
            </p>
            {user?.skills && user.skills.length > 0 ? (
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span className="text-slate-400 font-medium">Top skills:</span>
                <div className="flex flex-wrap gap-1.5">
                  {user.skills.slice(0, 4).map((skill) => (
                    <span
                      key={skill.id}
                      className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700/80 text-indigo-300 font-medium"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                Add technical and professional skills to highlight your expertise.
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/skills"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-500/20"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Manage Skills</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Experience Summary Card */}
      {(() => {
        const currentExp = user?.experience?.find((e) => e.current);
        return (
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-400" />
                <span>Work Experience</span>
              </h2>
              <Link
                href="/dashboard/experience"
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Manage Experience →
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-950/90 border border-slate-800">
              <div className="space-y-1">
                <p className="text-2xl font-bold text-white tracking-tight">
                  {user?.experience?.length || 0} position{(user?.experience?.length || 0) === 1 ? "" : "s"}
                </p>
                {currentExp ? (
                  <div className="space-y-0.5 text-xs">
                    <span className="text-emerald-400 font-semibold uppercase tracking-wider text-[10px]">
                      Current Role
                    </span>
                    <p className="text-slate-200 font-semibold">{currentExp.position}</p>
                    <p className="text-slate-400">{currentExp.company}</p>
                  </div>
                ) : user?.experience && user.experience.length > 0 ? (
                  <div className="space-y-0.5 text-xs">
                    <span className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">
                      Latest Role
                    </span>
                    <p className="text-slate-200 font-semibold">{user.experience[0].position}</p>
                    <p className="text-slate-400">{user.experience[0].company}</p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">
                    Add your employment history to build a timeline of your career.
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard/experience"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-500/20"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Manage Experience</span>
                </Link>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Education Summary Card */}
      {(() => {
        const latestEdu = user?.education?.[0];
        const eduCount = user?.education?.length || 0;
        return (
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-400" />
                <span>Education</span>
              </h2>
              <Link
                href="/dashboard/education"
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Manage Education →
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-950/90 border border-slate-800">
              <div className="space-y-1">
                <p className="text-2xl font-bold text-white tracking-tight">
                  {eduCount} qualification{eduCount === 1 ? "" : "s"}
                </p>
                {latestEdu ? (
                  <div className="space-y-0.5 text-xs">
                    <span className="text-indigo-400 font-semibold uppercase tracking-wider text-[10px]">
                      {latestEdu.current ? "Current Studies" : "Latest Qualification"}
                    </span>
                    <p className="text-slate-200 font-semibold">{getDegreeLabel(latestEdu.degree, latestEdu.customDegree)}</p>
                    <p className="text-slate-400">{latestEdu.institution}</p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">
                    Add your academic background to complete your portfolio.
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard/education"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-500/20"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Manage Education</span>
                </Link>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Account Details & Public Link Card */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-400" />
            <span>Public Portfolio URL</span>
          </h2>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Live</span>
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-950/90 border border-slate-800">
          <div className="space-y-0.5">
            <p className="text-xs text-slate-400 font-semibold uppercase">
              Public Handle
            </p>
            <p className="font-mono text-base text-indigo-300 font-semibold">
              myfolio.com/{userUsername}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/username"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Change Handle</span>
            </Link>

            <Link
              href={`/${userUsername}`}
              target="_blank"
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
            >
              <span>View Portfolio</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
