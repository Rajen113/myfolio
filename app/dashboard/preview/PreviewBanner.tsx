"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Globe,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { getPortfolioUrl } from "@/lib/utils/portfolio-url";
import { getRootDomain } from "@/lib/utils/subdomain";

interface PreviewBannerProps {
  isPublished: boolean;
  username: string | null;
}

export default function PreviewBanner({
  isPublished: initialIsPublished,
  username,
}: PreviewBannerProps) {
  const router = useRouter();
  const [isPublished, setIsPublished] = useState(initialIsPublished);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const liveUrl = username ? getPortfolioUrl(username) : "";
  const rootDomain = getRootDomain();
  const displaySubdomain = username ? `${username}.${rootDomain}` : "";

  const handlePublish = async () => {
    setIsPublishing(true);
    setErrorMessage("");
    setToastMessage("");

    try {
      const res = await fetch("/api/portfolio/publish", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to publish portfolio.");
      }

      setIsPublished(true);
      setShowConfirmModal(false);
      setToastMessage("✓ Your portfolio is now live!");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed to publish portfolio.");
      }
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <>
      <div className="sticky top-0 z-50 bg-slate-900/95 border-b border-indigo-500/30 backdrop-blur-md text-white px-4 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>

            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isPublished ? "bg-emerald-400" : "bg-amber-400"
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    isPublished ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
              </span>
              <span className="font-bold text-slate-200">
                {isPublished ? "Public Live Mode" : "Draft Preview Mode"}
              </span>
              <span className="hidden md:inline text-slate-400 font-normal">
                ({isPublished ? "Visible to anyone with link" : "Only visible to you as owner"})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {toastMessage && (
              <span className="text-emerald-400 font-semibold flex items-center gap-1 animate-fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{toastMessage}</span>
              </span>
            )}

            {errorMessage && (
              <span className="text-rose-400 font-semibold flex items-center gap-1 animate-fade-in">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errorMessage}</span>
              </span>
            )}

            {!isPublished ? (
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold transition-all shadow-md shadow-indigo-500/20 active:scale-[0.98]"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Publish Portfolio</span>
              </button>
            ) : (
              liveUrl && (
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  suppressHydrationWarning
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-600/30 font-semibold transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>View Live Site</span>
                </a>
              )
            )}
          </div>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-400" />
                <span>Publish Portfolio?</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Your portfolio will become publicly visible at:
              </p>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-400 font-bold text-center">
                {displaySubdomain}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed pt-1">
                Anyone with this URL will be able to view your public portfolio website.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPublishing}
                onClick={handlePublish}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <span>Publish Now</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
