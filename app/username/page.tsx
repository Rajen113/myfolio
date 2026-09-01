"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { AtSign, CheckCircle2, XCircle, Loader2, Globe, ArrowLeft, Sparkles } from "lucide-react";

export default function UsernameSetupPage() {
  const router = useRouter();
  const { data: session, update: updateSession, status: authStatus } = useSession();

  const [username, setUsername] = useState(() => session?.user?.username || "");
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Debounced API check for username availability
  const checkAvailability = useCallback(async (val: string) => {
    setChecking(true);
    setAvailable(null);
    setStatusMessage("Checking availability...");

    try {
      const res = await fetch(`/api/username/check?username=${encodeURIComponent(val)}`);
      const data = await res.json();

      setChecking(false);
      setAvailable(data.available);
      setStatusMessage(data.message || (data.available ? "✓ Username available" : "✕ Username unavailable"));
    } catch (err) {
      console.error("Check error:", err);
      setChecking(false);
      setAvailable(false);
      setStatusMessage("Error checking availability");
    }
  }, []);

  useEffect(() => {
    const trimmed = username.toLowerCase().trim();
    if (!trimmed || trimmed.length < 3) {
      return;
    }

    const timer = setTimeout(() => {
      checkAvailability(trimmed);
    }, 350);

    return () => clearTimeout(timer);
  }, [username, checkAvailability]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Automatically normalize uppercase input to lowercase
    const normalized = e.target.value.toLowerCase().replace(/\s+/g, "");
    setUsername(normalized);
    setSubmitError("");
    setAvailable(null);
    setStatusMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!available || checking) return;

    setSubmitting(true);

    try {
      const res = await fetch("/api/username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to set username");
      }

      // Update Session & Redirect to Dashboard
      await updateSession({ username: data.username });
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setSubmitError(err.message);
      } else {
        setSubmitError("An error occurred while saving your username.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (authStatus === "loading") {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
          <span>Loading session...</span>
        </div>
      </div>
    );
  }

  if (authStatus === "unauthenticated") {
    router.push("/login");
    return null;
  }

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 glass-card p-8 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Top Glow Accent */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-600/15 blur-3xl rounded-full pointer-events-none" />

        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Choose your username
          </h1>
          <p className="text-sm text-slate-400">
            Your username will become your public portfolio URL.
          </p>
        </div>

        {submitError && (
          <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
            <XCircle className="w-4 h-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <AtSign className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={handleInputChange}
                placeholder="rajenmandal"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-mono transition-colors"
              />
            </div>

            {/* Live Portfolio URL Preview */}
            <div className="mt-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2 text-xs">
              <Globe className="w-4 h-4 text-slate-500 shrink-0" />
              <div className="truncate">
                <span className="text-slate-500">Your portfolio URL: </span>
                <span className="font-mono text-indigo-300 font-semibold">
                  myfolio.com/{username || "username"}
                </span>
              </div>
            </div>

            {/* Live Status Indicator */}
            {username.trim().length > 0 && (
              <div className="mt-2 text-xs">
                {checking ? (
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                    <span>Checking availability...</span>
                  </div>
                ) : available === true ? (
                  <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{statusMessage}</span>
                  </div>
                ) : available === false ? (
                  <div className="flex items-center gap-1.5 text-rose-400 font-medium">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>{statusMessage}</span>
                  </div>
                ) : username.trim().length < 3 ? (
                  <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                    <span>Username must be at least 3 characters</span>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Link
              href="/dashboard"
              className="flex-1 py-3 px-4 text-center rounded-xl text-sm font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={!available || checking || submitting}
              className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Continue</span>
              )}
            </button>
          </div>
        </form>

        <div className="text-center pt-2 border-t border-slate-800">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
