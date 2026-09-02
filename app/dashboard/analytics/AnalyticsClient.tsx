"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Eye,
  Users,
  Clock,
  Calendar,
  TrendingUp,
  BarChart3,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  ExternalLink,
  Copy,
  Check,
  HelpCircle,
} from "lucide-react";
import { PortfolioAnalyticsData } from "@/lib/analytics/types";

interface AnalyticsClientProps {
  initialData: PortfolioAnalyticsData;
  primaryUrl: string;
  isPublished: boolean;
}

export default function AnalyticsClient({
  initialData,
  primaryUrl,
  isPublished,
}: AnalyticsClientProps) {
  const [rangeDays, setRangeDays] = useState<number>(initialData.rangeDays);
  const [data, setData] = useState<PortfolioAnalyticsData>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleRangeChange = async (newRange: number) => {
    if (newRange === rangeDays || isLoading) return;
    setRangeDays(newRange);
    setIsLoading(true);

    try {
      const res = await fetch(`/api/portfolio/analytics?range=${newRange}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to update analytics range:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(primaryUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const { summary, timeSeries, topReferrers, deviceBreakdown, countryBreakdown } = data;

  const maxDailyViews = Math.max(1, ...timeSeries.map((t) => t.views));

  return (
    <div className="space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            <BarChart3 className="w-4 h-4" />
            <span>Traffic Insights</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Portfolio Analytics
          </h1>
          <p className="text-sm text-slate-400">
            Track visitors, page views, referral traffic, and devices visiting your public portfolio.
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800 self-start sm:self-center">
          {[7, 30, 90].map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => handleRangeChange(days)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                rangeDays === days
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {days} Days
            </button>
          ))}
        </div>
      </div>

      {/* EMPTY STATE */}
      {summary.totalViews === 0 ? (
        <div className="glass-card p-10 sm:p-14 rounded-2xl border border-slate-800 text-center space-y-6 max-w-2xl mx-auto my-8">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
            <BarChart3 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">No Visitors Yet</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              {isPublished
                ? "Your portfolio is published and ready! Share your unique portfolio link on LinkedIn, Twitter, GitHub, or your resume to start tracking analytics."
                : "Your portfolio is currently a draft. Publish your portfolio to make it publicly accessible and track real-time analytics."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {isPublished ? (
              <>
                <a
                  href={primaryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View Portfolio</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Portfolio URL</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20"
              >
                <span>Go to Dashboard & Publish</span>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* KPI CARDS GRID */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
            {/* Total Views */}
            <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Total Views</span>
                <Eye className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">
                {summary.totalViews.toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-500 font-mono">All-time views</p>
            </div>

            {/* Unique Visitors */}
            <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Unique Visitors</span>
                <Users className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">
                {summary.uniqueVisitors.toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-500 font-mono">Distinct IP/UA</p>
            </div>

            {/* Views Today */}
            <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Views Today</span>
                <Clock className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">
                {summary.viewsToday.toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-500 font-mono">Since 00:00 UTC</p>
            </div>

            {/* Last 7 Days */}
            <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Last 7 Days</span>
                <Calendar className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">
                {summary.viewsLast7Days.toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-500 font-mono">Past week</p>
            </div>

            {/* Last 30 Days */}
            <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2 col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Last 30 Days</span>
                <TrendingUp className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">
                {summary.viewsLast30Days.toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-500 font-mono">Past month</p>
            </div>
          </div>

          {/* VIEWS OVER TIME CHART */}
          <div className="glass-card p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                  <span>Views Over Time</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Daily breakdown of page views and unique visitors for the last {rangeDays} days.
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-indigo-500" />
                  <span>Views</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-purple-400" />
                  <span>Visitors</span>
                </div>
              </div>
            </div>

            {/* BAR CHART */}
            <div className="pt-4">
              <div className="h-64 w-full flex items-end gap-1.5 sm:gap-2 pt-6 pb-2 px-2 border-b border-slate-800">
                {timeSeries.map((point) => {
                  const heightPercent = Math.max(
                    6,
                    Math.round((point.views / maxDailyViews) * 100)
                  );
                  const visitorHeightPercent = Math.max(
                    4,
                    Math.round((point.uniqueVisitors / maxDailyViews) * 100)
                  );

                  return (
                    <div
                      key={point.date}
                      className="flex-1 flex flex-col items-center justify-end h-full group relative"
                    >
                      {/* Tooltip */}
                      <div className="absolute -top-12 z-20 hidden group-hover:flex flex-col items-center bg-slate-900 border border-slate-700 text-white text-[11px] p-2 rounded-lg shadow-xl pointer-events-none whitespace-nowrap">
                        <span className="font-bold font-mono">{point.date}</span>
                        <span className="text-indigo-300">{point.views} views</span>
                        <span className="text-purple-300">{point.uniqueVisitors} visitors</span>
                      </div>

                      {/* Bar Stack */}
                      <div className="w-full max-w-[28px] flex gap-0.5 items-end h-full">
                        <div
                          className="w-1/2 bg-gradient-to-t from-indigo-700 to-indigo-500 rounded-t transition-all group-hover:from-indigo-600 group-hover:to-indigo-400"
                          style={{ height: `${heightPercent}%` }}
                        />
                        <div
                          className="w-1/2 bg-gradient-to-t from-purple-700 to-purple-400 rounded-t transition-all group-hover:from-purple-600 group-hover:to-purple-300"
                          style={{ height: `${visitorHeightPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* X-Axis Date Labels */}
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-3 px-1">
                <span>{timeSeries[0]?.date}</span>
                <span>{timeSeries[Math.floor(timeSeries.length / 2)]?.date}</span>
                <span>{timeSeries[timeSeries.length - 1]?.date}</span>
              </div>
            </div>
          </div>

          {/* BREAKDOWN SECTIONS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Top Referrers Card */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 shadow-lg">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Globe className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Top Referrers
                </h3>
              </div>

              <div className="space-y-3">
                {topReferrers.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-4 text-center">
                    No referrer data available
                  </p>
                ) : (
                  topReferrers.map((ref) => (
                    <div key={ref.domain} className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200 font-mono truncate max-w-[180px]">
                          {ref.domain}
                        </span>
                        <span className="text-slate-400 font-mono">
                          {ref.count} ({ref.percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${Math.max(4, ref.percentage)}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Device Breakdown Card */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 shadow-lg">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Monitor className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Device Breakdown
                </h3>
              </div>

              <div className="space-y-4">
                {[
                  { label: "Desktop", count: deviceBreakdown.desktop, icon: Monitor },
                  { label: "Mobile", count: deviceBreakdown.mobile, icon: Smartphone },
                  { label: "Tablet", count: deviceBreakdown.tablet, icon: Tablet },
                  { label: "Unknown", count: deviceBreakdown.unknown, icon: HelpCircle },
                ].map((item) => {
                  const total =
                    deviceBreakdown.desktop +
                      deviceBreakdown.mobile +
                      deviceBreakdown.tablet +
                      deviceBreakdown.unknown || 1;
                  const pct = Math.round((item.count / total) * 100);
                  const Icon = item.icon;

                  return (
                    <div key={item.label} className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 font-medium text-slate-300">
                          <Icon className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.label}</span>
                        </span>
                        <span className="font-mono text-slate-400">
                          {item.count} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${Math.max(2, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Country Breakdown Card */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 shadow-lg">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Globe className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Country Breakdown
                </h3>
              </div>

              <div className="space-y-3">
                {countryBreakdown === null || countryBreakdown.length === 0 ? (
                  <div className="text-center py-6 space-y-1">
                    <p className="text-xs font-semibold text-slate-400">
                      Country data unavailable
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Coarse geolocation header was not attached by host environment.
                    </p>
                  </div>
                ) : (
                  countryBreakdown.map((c) => (
                    <div key={c.code} className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-slate-300 font-bold uppercase">
                          {c.country}
                        </span>
                        <span className="font-mono text-slate-400">
                          {c.count} ({c.percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{ width: `${Math.max(4, c.percentage)}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
