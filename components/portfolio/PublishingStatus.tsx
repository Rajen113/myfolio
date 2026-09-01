"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Globe,
  Eye,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Lock,
} from "lucide-react";

interface ReadinessItem {
  label: string;
  completed: boolean;
  count?: number;
  optional?: boolean;
}

interface PublishingStatusProps {
  initialIsPublished: boolean;
  username: string;
  readiness?: ReadinessItem[];
}

export default function PublishingStatus({
  initialIsPublished,
  username,
  readiness,
}: PublishingStatusProps) {
  const router = useRouter();
  const [isPublished, setIsPublished] = useState(initialIsPublished);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showUnpublishModal, setShowUnpublishModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const publicUrl = typeof window !== "undefined"
    ? `${window.location.origin}/${username}`
    : `https://myfolio.com/${username}`;

  const shortDisplayUrl = `myfolio.com/${username}`;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(publicUrl);
      } else {
        // Fallback for non-HTTPS or legacy browsers
        const textArea = document.createElement("textarea");
        textArea.value = publicUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setErrorMessage("Failed to copy link. Please copy manually.");
    }
  };

  const handlePublish = async () => {
    setIsSubmitting(true);
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
      setShowPublishModal(false);
      setToastMessage("✓ Your portfolio is now live!");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("An error occurred while publishing.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnpublish = async () => {
    setIsSubmitting(true);
    setErrorMessage("");
    setToastMessage("");

    try {
      const res = await fetch("/api/portfolio/unpublish", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to unpublish portfolio.");
      }

      setIsPublished(false);
      setShowUnpublishModal(false);
      setToastMessage("✓ Portfolio unpublished successfully.");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("An error occurred while unpublishing.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-card p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6 shadow-xl relative overflow-hidden">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Portfolio Status
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isPublished ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Published</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Not Published (Draft)</span>
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Display URL or Privacy Note */}
        <div className="text-xs font-mono">
          {isPublished ? (
            <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 text-indigo-400 font-semibold">
              <Globe className="w-4 h-4 shrink-0 text-indigo-400" />
              <span className="truncate max-w-[200px] sm:max-w-xs">{shortDisplayUrl}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-400 bg-slate-950/60 px-3.5 py-2 rounded-xl border border-slate-800/80">
              <Lock className="w-4 h-4 shrink-0 text-slate-500" />
              <span>Your portfolio is currently private</span>
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      {toastMessage && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Readiness Summary Checklist if provided */}
      {readiness && readiness.length > 0 && !isPublished && (
        <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 text-xs">
          <span className="font-bold text-slate-300 uppercase tracking-wider block">
            Publish Readiness Checklist
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {readiness.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-slate-300">
                {item.completed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border border-slate-600 shrink-0 inline-block" />
                )}
                <span className="truncate">
                  {item.label}
                  {item.count !== undefined && item.count > 0 ? ` (${item.count})` : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        {!isPublished ? (
          <>
            <button
              type="button"
              onClick={() => setShowPublishModal(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs transition-all shadow-md shadow-indigo-500/20 active:scale-[0.98]"
            >
              <Globe className="w-4 h-4" />
              <span>Publish Portfolio</span>
            </button>

            <Link
              href="/dashboard/preview"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-semibold text-xs transition-colors"
            >
              <Eye className="w-4 h-4 text-indigo-400" />
              <span>Preview Draft</span>
            </Link>
          </>
        ) : (
          <>
            <a
              href={`/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs transition-all shadow-md shadow-indigo-500/20 active:scale-[0.98]"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open Portfolio</span>
            </a>

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-semibold text-xs transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-indigo-400" />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            <Link
              href="/dashboard/preview"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-semibold text-xs transition-colors"
            >
              <Eye className="w-4 h-4 text-indigo-400" />
              <span>Preview</span>
            </Link>

            <button
              type="button"
              onClick={() => setShowUnpublishModal(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-rose-950/30 border border-slate-800 hover:border-rose-800/50 text-slate-400 hover:text-rose-400 font-semibold text-xs transition-colors ml-auto"
            >
              <Lock className="w-4 h-4" />
              <span>Unpublish</span>
            </button>
          </>
        )}
      </div>

      {/* PUBLISH CONFIRMATION MODAL */}
      {showPublishModal && (
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
                myfolio.com/{username}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed pt-1">
                Anyone with this URL will be able to view your public portfolio website.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handlePublish}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <span>Publish</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UNPUBLISH CONFIRMATION MODAL */}
      {showUnpublishModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 text-rose-400">
                <Lock className="w-5 h-5" />
                <span>Unpublish Portfolio?</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Your portfolio will no longer be publicly accessible at{" "}
                <span className="font-mono text-indigo-300 font-semibold">myfolio.com/{username}</span>.
              </p>
              <p className="text-xs text-slate-400 leading-relaxed pt-1">
                Your profile, projects, skills, experience, and education data will NOT be deleted.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowUnpublishModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleUnpublish}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-500/20 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Unpublishing...</span>
                  </>
                ) : (
                  <span>Unpublish</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
