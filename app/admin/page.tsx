import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Users,
  Briefcase,
  Eye,
  Mail,
  Globe,
  UserPlus,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  await requireAdmin();

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Execute efficient aggregate queries concurrently
  const [
    totalUsers,
    publishedPortfolios,
    totalPortfolioViews,
    unreadMessages,
    activeCustomDomains,
    newUsersToday,
    newUsersThisWeek,
    recentUsers,
    recentAuditLogs,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.portfolioSettings.count({ where: { isPublished: true } }),
    prisma.portfolioViewEvent.count(),
    prisma.contactMessage.count({ where: { status: "UNREAD" } }),
    prisma.customDomain.count({ where: { status: "ACTIVE" } }),
    prisma.user.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.adminAuditLog.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        action: true,
        targetType: true,
        targetId: true,
        createdAt: true,
        adminUser: {
          select: { name: true, email: true },
        },
      },
    }),
  ]);

  const METRIC_CARDS = [
    {
      title: "Total Users",
      value: totalUsers.toLocaleString(),
      subtitle: `${newUsersThisWeek} new this week`,
      icon: Users,
      color: "from-blue-600/20 to-indigo-600/20 text-blue-400 border-blue-500/30",
      href: "/admin/users",
    },
    {
      title: "Published Portfolios",
      value: publishedPortfolios.toLocaleString(),
      subtitle: `${totalUsers ? Math.round((publishedPortfolios / totalUsers) * 100) : 0}% publication rate`,
      icon: Briefcase,
      color: "from-emerald-600/20 to-teal-600/20 text-emerald-400 border-emerald-500/30",
      href: "/admin/portfolios",
    },
    {
      title: "Total Portfolio Views",
      value: totalPortfolioViews.toLocaleString(),
      subtitle: "Platform total views",
      icon: Eye,
      color: "from-purple-600/20 to-indigo-600/20 text-purple-400 border-purple-500/30",
      href: "/admin/analytics",
    },
    {
      title: "Unread Messages",
      value: unreadMessages.toLocaleString(),
      subtitle: "Requires attention",
      icon: Mail,
      color: "from-amber-600/20 to-orange-600/20 text-amber-400 border-amber-500/30",
      href: "/admin/messages",
    },
    {
      title: "Active Domains",
      value: activeCustomDomains.toLocaleString(),
      subtitle: "Verified custom domains",
      icon: Globe,
      color: "from-cyan-600/20 to-blue-600/20 text-cyan-400 border-cyan-500/30",
      href: "/admin/domains",
    },
    {
      title: "New Users Today",
      value: newUsersToday.toLocaleString(),
      subtitle: `${newUsersThisWeek} in past 7 days`,
      icon: UserPlus,
      color: "from-rose-600/20 to-pink-600/20 text-rose-400 border-rose-500/30",
      href: "/admin/users",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Platform Overview
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time internal statistics and system health indicators.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl text-xs font-semibold text-emerald-400">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>System Healthy</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {METRIC_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="group relative bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 p-6 rounded-2xl transition-all duration-200 shadow-xl overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {card.title}
                </span>
                <div
                  className={`p-2.5 rounded-xl bg-gradient-to-br border ${card.color} transition-transform group-hover:scale-110`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-black text-white tracking-tight">{card.value}</p>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-slate-500" />
                  <span>{card.subtitle}</span>
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-medium text-indigo-400 group-hover:text-indigo-300">
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Registrations */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5 border-b border-slate-800 pb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              <span>Recent Registrations</span>
            </h2>
            <Link href="/admin/users" className="text-xs text-indigo-400 hover:underline">
              View All
            </Link>
          </div>
          <div className="divide-y divide-slate-800">
            {recentUsers.map((user) => (
              <div key={user.id} className="py-3 flex items-center justify-between text-sm">
                <div>
                  <p className="font-semibold text-slate-200">{user.name || user.username || "Anonymous"}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                      user.role === "ADMIN"
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {user.role}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Audit Logs */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5 border-b border-slate-800 pb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
              <span>Recent Audit Events</span>
            </h2>
            <Link href="/admin/audit-logs" className="text-xs text-purple-400 hover:underline">
              View All
            </Link>
          </div>
          <div className="divide-y divide-slate-800">
            {recentAuditLogs.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No administrative actions logged yet.</p>
            ) : (
              recentAuditLogs.map((log) => (
                <div key={log.id} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <span className="font-mono text-xs font-semibold text-purple-300 bg-purple-950/60 border border-purple-800/60 px-2 py-0.5 rounded">
                      {log.action}
                    </span>
                    <p className="text-xs text-slate-400 mt-1">
                      By {log.adminUser?.name || log.adminUser?.email || "Admin"}
                    </p>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <span className="text-slate-400">{log.targetType}</span>
                    <p className="text-[11px] mt-0.5">{new Date(log.createdAt).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
