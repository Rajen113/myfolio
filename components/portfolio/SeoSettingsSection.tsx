"use client";

import { useState } from "react";
import {
  Search,
  Share2,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Globe,
  Sparkles,
} from "lucide-react";
import { PortfolioData } from "@/types/portfolio";

interface SeoSettingsSectionProps {
  initialSeoTitle: string | null;
  initialSeoDescription: string | null;
  portfolioData: PortfolioData;
  themeColor?: string;
  primaryUrl?: string;
}

export default function SeoSettingsSection({
  initialSeoTitle,
  initialSeoDescription,
  portfolioData,
  themeColor = "#2563EB",
  primaryUrl,
}: SeoSettingsSectionProps) {
  const [seoTitle, setSeoTitle] = useState(initialSeoTitle || "");
  const [seoDescription, setSeoDescription] = useState(initialSeoDescription || "");
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const name = portfolioData.profile?.fullName || portfolioData.name || portfolioData.username;
  const headline = portfolioData.profile?.headline || "Professional Portfolio";
  const bio = portfolioData.profile?.bio || "";
  const skillNames = portfolioData.skills.map((s) => s.name).join(" • ");

  // Fallbacks
  const defaultTitle = `${name} | ${headline}`;
  const defaultDesc =
    bio.slice(0, 150) ||
    `${name} is a ${headline} with expertise in ${skillNames || "modern technology"}. View projects, skills, experience, and education.`;

  const previewTitle = seoTitle.trim() || defaultTitle;
  const previewDescription = seoDescription.trim() || defaultDesc;
  const displayUrl = primaryUrl || `https://${portfolioData.username}.myfolio.com`;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const res = await fetch("/api/portfolio/seo", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seoTitle: seoTitle.trim() || null,
          seoDescription: seoDescription.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update SEO settings.");
      }

      setSuccessMessage("✓ SEO title & description saved successfully!");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("An unexpected error occurred.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Alert Messages */}
      {successMessage && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="glass-card p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6 shadow-xl">
        <div className="space-y-1.5 border-b border-slate-800 pb-5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Search className="w-5 h-5 text-indigo-400" />
            <span>Search Engine & Social Media Customization</span>
          </h2>
          <p className="text-xs text-slate-400">
            Control how your portfolio appears in Google search results and when shared on LinkedIn, Twitter/X, WhatsApp, and Slack.
          </p>
        </div>

        {/* Inputs Grid */}
        <div className="space-y-5">
          {/* SEO Title Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Search Engine Title
              </label>
              <span className={`text-[11px] font-mono ${seoTitle.length > 70 ? "text-rose-400 font-bold" : "text-slate-500"}`}>
                {seoTitle.length} / 70 max chars
              </span>
            </div>
            <input
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder={defaultTitle}
              maxLength={70}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 transition-colors font-sans"
            />
            <p className="text-[11px] text-slate-500">
              Leave blank to automatically use generated default format: <span className="text-slate-400 font-medium">{defaultTitle}</span>
            </p>
          </div>

          {/* SEO Description Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Search Engine Description
              </label>
              <span className={`text-[11px] font-mono ${seoDescription.length > 200 ? "text-rose-400 font-bold" : "text-slate-500"}`}>
                {seoDescription.length} / 200 max chars
              </span>
            </div>
            <textarea
              rows={3}
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              placeholder={defaultDesc}
              maxLength={200}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 transition-colors font-sans"
            />
            <p className="text-[11px] text-slate-500">
              Summarize your technical skills, experience, and value. Plain text only.
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save SEO Settings</span>
          </button>
        </div>
      </form>

      {/* PREVIEWS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Google Search Snippet Preview */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 shadow-lg">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-3">
            <Search className="w-4 h-4 text-emerald-400" />
            <span>Google Search Result Preview</span>
          </div>

          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-400 truncate">
              <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate font-mono text-[11px]">{displayUrl}</span>
            </div>

            <h3 className="text-base font-semibold text-blue-400 hover:underline cursor-pointer line-clamp-1">
              {previewTitle}
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
              {previewDescription}
            </p>
          </div>
        </div>

        {/* Social Media Sharing Card Preview */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 shadow-lg">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-3">
            <Share2 className="w-4 h-4 text-indigo-400" />
            <span>Social Card Preview (OG Image)</span>
          </div>

          <div
            className="rounded-xl border p-5 flex flex-col justify-between relative overflow-hidden aspect-[1200/630] bg-slate-950"
            style={{
              borderColor: `${themeColor}44`,
              backgroundImage: `radial-gradient(circle at 50% 0%, ${themeColor}22 0%, rgba(3, 7, 18, 0.95) 70%)`,
            }}
          >
            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400">
              <span className="flex items-center gap-1 text-indigo-400">
                <Sparkles className="w-3 h-3" /> Portfolio
              </span>
              <span>MyFolio</span>
            </div>

            <div className="space-y-1 my-auto text-center">
              <h4 className="text-base sm:text-lg font-extrabold text-white tracking-tight line-clamp-1">
                {name}
              </h4>
              <p className="text-xs font-medium text-slate-400 line-clamp-1">
                {headline}
              </p>
              {skillNames && (
                <p className="text-[10px] font-semibold text-indigo-300/80 pt-1 line-clamp-1">
                  {skillNames}
                </p>
              )}
            </div>

            <div className="text-[9px] text-slate-500 font-mono text-right">
              1200 × 630 preview
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
