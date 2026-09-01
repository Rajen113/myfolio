import Link from "next/link";
import { LayoutDashboard, User, Palette, Layers, ExternalLink } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold mb-1">
            <LayoutDashboard className="w-4 h-4" />
            <span>Developer Workspace</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Dashboard Placeholder
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your developer profile, skills, projects, and custom portfolio templates.
          </p>
        </div>

        <Link
          href="/rajenmandal"
          target="_blank"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-indigo-300 font-medium text-sm transition-colors self-start sm:self-auto"
        >
          <span>Preview Public Profile</span>
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>

      {/* Grid of Dashboard Placeholder Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="glass-card p-6 rounded-2xl space-y-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <User className="w-5 h-5" />
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-400">Step 1 Ready</span>
          </div>
          <h2 className="text-lg font-semibold text-white">Profile Information</h2>
          <p className="text-xs text-slate-400">
            Edit full name, bio, profile image, contact details, and social platform links.
          </p>
          <button disabled className="w-full py-2 px-3 text-xs font-medium rounded-lg bg-slate-800 text-slate-500 cursor-not-allowed">
            Edit Profile (Step 2+)
          </button>
        </div>

        {/* Experience & Projects */}
        <div className="glass-card p-6 rounded-2xl space-y-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-400">Step 1 Ready</span>
          </div>
          <h2 className="text-lg font-semibold text-white">Skills & Projects</h2>
          <p className="text-xs text-slate-400">
            Add tech stack tags, project showcases, github repositories, and work history.
          </p>
          <button disabled className="w-full py-2 px-3 text-xs font-medium rounded-lg bg-slate-800 text-slate-500 cursor-not-allowed">
            Manage Content (Step 2+)
          </button>
        </div>

        {/* Templates */}
        <div className="glass-card p-6 rounded-2xl space-y-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
              <Palette className="w-5 h-5" />
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-400">Step 1 Ready</span>
          </div>
          <h2 className="text-lg font-semibold text-white">Themes & Templates</h2>
          <p className="text-xs text-slate-400">
            Select modern layout templates, color palettes, and typography presets.
          </p>
          <button disabled className="w-full py-2 px-3 text-xs font-medium rounded-lg bg-slate-800 text-slate-500 cursor-not-allowed">
            Choose Theme (Step 2+)
          </button>
        </div>
      </div>
    </div>
  );
}
