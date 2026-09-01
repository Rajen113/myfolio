import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LogoutButton from "@/components/LogoutButton";
import { LayoutDashboard, User as UserIcon, Mail, AtSign, ExternalLink, ShieldCheck } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/login");
  }

  // Fetch full user record from database
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

  const displayName = user?.name || session.user.name || user?.username || "User";
  const userEmail = user?.email || session.user.email || "";
  const userUsername = user?.username || (session.user as { username?: string }).username || "";

  return (
    <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold">
            <LayoutDashboard className="w-4 h-4" />
            <span>Authenticated Workspace</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Welcome, {displayName}
          </h1>
          <p className="text-sm text-slate-400">
            Manage your developer portfolio account and configuration.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {userUsername && (
            <Link
              href={`/${userUsername}`}
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/30 text-indigo-300 font-medium text-sm transition-colors"
            >
              <span>View Public Portfolio</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
          )}

          <LogoutButton variant="default" />
        </div>
      </div>

      {/* Authenticated User Details Card */}
      <div className="glass-card p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-indigo-400" />
            <span>Account Session Profile</span>
          </h2>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Session Active</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-indigo-400" />
              <span>Email:</span>
            </label>
            <p className="text-base font-medium text-white break-all">
              {userEmail}
            </p>
          </div>

          <div className="space-y-1.5 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <AtSign className="w-3.5 h-3.5 text-purple-400" />
              <span>Username:</span>
            </label>
            <p className="text-base font-mono font-medium text-purple-300">
              {userUsername}
            </p>
          </div>
        </div>

        {/* Dynamic Route Info */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
          <p className="font-semibold text-slate-300">Your Live Portfolio URL:</p>
          <p className="font-mono text-indigo-300">
            myfolio.com/{userUsername}
          </p>
        </div>
      </div>
    </div>
  );
}
