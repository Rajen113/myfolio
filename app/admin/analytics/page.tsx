import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";
import { Eye, Globe, Monitor, Smartphone, Tablet } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  await requireAdmin();

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalViews,
    viewsToday,
    views7Days,
    views30Days,
    deviceStats,
    referrerStats,
    topPortfolios,
  ] = await Promise.all([
    prisma.portfolioViewEvent.count(),
    prisma.portfolioViewEvent.count({ where: { viewedAt: { gte: startOfToday } } }),
    prisma.portfolioViewEvent.count({ where: { viewedAt: { gte: sevenDaysAgo } } }),
    prisma.portfolioViewEvent.count({ where: { viewedAt: { gte: thirtyDaysAgo } } }),
    prisma.portfolioViewEvent.groupBy({
      by: ["deviceType"],
      _count: { deviceType: true },
      where: { viewedAt: { gte: thirtyDaysAgo } },
    }),
    prisma.portfolioViewEvent.groupBy({
      by: ["referrerDomain"],
      _count: { referrerDomain: true },
      where: { viewedAt: { gte: thirtyDaysAgo } },
      orderBy: { _count: { referrerDomain: "desc" } },
      take: 8,
    }),
    prisma.portfolioViewEvent.groupBy({
      by: ["userId"],
      _count: { userId: true },
      where: { viewedAt: { gte: thirtyDaysAgo } },
      orderBy: { _count: { userId: "desc" } },
      take: 5,
    }),
  ]);

  // Resolve usernames for top portfolios
  const topUserIds = topPortfolios.map((p) => p.userId);
  const topUsersMap = await prisma.user.findMany({
    where: { id: { in: topUserIds } },
    select: { id: true, username: true, name: true, email: true },
  });
  const userLookup = new Map(topUsersMap.map((u) => [u.id, u.username ? `@${u.username}` : u.name || u.email]));

  return (
    <div className="space-y-8">
      {/* Title Bar */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Platform Analytics
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Aggregate traffic metrics and performance statistics across all published portfolios.
        </p>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Views</span>
          <p className="text-3xl font-black text-white mt-2">{totalViews.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">All time page loads</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Views Today</span>
          <p className="text-3xl font-black text-indigo-400 mt-2">{viewsToday.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">Since midnight</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Views (7 Days)</span>
          <p className="text-3xl font-black text-purple-400 mt-2">{views7Days.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">Past week</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Views (30 Days)</span>
          <p className="text-3xl font-black text-emerald-400 mt-2">{views30Days.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">Past month</p>
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Device Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3 flex items-center gap-2">
            <Monitor className="w-4 h-4 text-indigo-400" />
            <span>Device Type (30 Days)</span>
          </h3>

          <div className="space-y-3">
            {deviceStats.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No view event data recorded yet.</p>
            ) : (
              deviceStats.map((d) => {
                const label = (d.deviceType || "desktop").toLowerCase();
                const pct = views30Days ? Math.round((d._count.deviceType / views30Days) * 100) : 0;
                return (
                  <div key={label} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="capitalize text-slate-300 flex items-center gap-2">
                        {label === "mobile" && <Smartphone className="w-3.5 h-3.5 text-indigo-400" />}
                        {label === "tablet" && <Tablet className="w-3.5 h-3.5 text-purple-400" />}
                        {label === "desktop" && <Monitor className="w-3.5 h-3.5 text-cyan-400" />}
                        {label}
                      </span>
                      <span className="text-slate-400">{d._count.deviceType} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div
                        className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Top Referrers */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>Top Referrer Domains</span>
          </h3>

          <div className="divide-y divide-slate-800">
            {referrerStats.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No referrer data recorded yet.</p>
            ) : (
              referrerStats.map((r) => (
                <div key={r.referrerDomain || "direct"} className="py-2.5 flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-300">{r.referrerDomain || "Direct / Bookmark"}</span>
                  <span className="font-semibold text-cyan-400">{r._count.referrerDomain} views</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Portfolios */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3 flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-400" />
            <span>Most Viewed Portfolios</span>
          </h3>

          <div className="divide-y divide-slate-800">
            {topPortfolios.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No portfolio views recorded yet.</p>
            ) : (
              topPortfolios.map((p) => (
                <div key={p.userId} className="py-2.5 flex items-center justify-between text-xs">
                  <span className="font-mono font-semibold text-slate-200">
                    {userLookup.get(p.userId) || "Unknown User"}
                  </span>
                  <span className="font-bold text-emerald-400">{p._count.userId} views</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
