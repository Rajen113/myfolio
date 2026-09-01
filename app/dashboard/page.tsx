import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LogoutButton from "@/components/LogoutButton";
import {
  LayoutDashboard,
  Mail,
  AtSign,
  ExternalLink,
  Edit3,
  ShieldCheck,
  Globe,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  // Fetch current user from PostgreSQL database
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      createdAt: true,
    },
  });

  // If logged-in user does not have a username set, redirect to /username setup
  if (!user || !user.username) {
    redirect("/username");
  }

  const displayName = user.name || user.username;
  const userEmail = user.email;
  const userUsername = user.username;

  return (
    <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Dashboard Top Header */}
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
            Manage your public portfolio URL and account configuration.
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

      {/* Main Public Portfolio & Username Card */}
      <div className="glass-card p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-400" />
            <span>Your Public Portfolio</span>
          </h2>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Live & Active</span>
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Public Portfolio URL
            </p>
            <p className="font-mono text-base sm:text-lg text-indigo-300 font-semibold">
              myfolio.com/{userUsername}
            </p>
          </div>

          <Link
            href={`/${userUsername}`}
            target="_blank"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-indigo-950 border border-slate-700 hover:border-indigo-500/50 text-indigo-300 text-sm font-medium transition-all self-start sm:self-auto"
          >
            <span>View Portfolio</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Username Configuration Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-1.5 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <AtSign className="w-3.5 h-3.5 text-purple-400" />
              <span>Username</span>
            </label>
            <div className="flex items-center justify-between">
              <p className="text-base font-mono font-semibold text-purple-300">
                {userUsername}
              </p>
              <Link
                href="/username"
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Change Username</span>
              </Link>
            </div>
          </div>

          <div className="space-y-1.5 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-indigo-400" />
              <span>Email</span>
            </label>
            <p className="text-base font-medium text-white break-all">
              {userEmail}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
          <span className="text-xs text-slate-500">Account ID: {user.id}</span>
          <LogoutButton variant="text" />
        </div>
      </div>
    </div>
  );
}
