"use client";

import { useState } from "react";
import {
  Globe,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  HelpCircle,
  Star,
} from "lucide-react";

export interface CustomDomainItem {
  id: string;
  domain: string;
  status: "PENDING" | "VERIFIED" | "ACTIVE" | "FAILED";
  verificationToken: string;
  isPrimary: boolean;
  verifiedAt: string | null;
  createdAt: string;
}

interface DomainsClientProps {
  initialDomains: CustomDomainItem[];
  username: string;
  cnameTarget: string;
}

export default function DomainsClient({
  initialDomains,
  cnameTarget,
}: DomainsClientProps) {
  const [domains, setDomains] = useState<CustomDomainItem[]>(initialDomains);
  const [newDomain, setNewDomain] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingPrimaryId, setSettingPrimaryId] = useState<string | null>(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<CustomDomainItem | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(key);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: newDomain }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to add domain.");
      }

      setDomains((prev) => [data.customDomain, ...prev.filter((d) => d.id !== data.customDomain.id)]);
      setNewDomain("");
      setSuccessMessage(`✓ Custom domain ${data.customDomain.domain} added! Please add the DNS TXT record below to verify.`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("An unexpected error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (id: string) => {
    setVerifyingId(id);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch(`/api/domains/${id}/verify`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "DNS verification failed.");
      }

      setDomains((prev) =>
        prev.map((d) => (d.id === id ? data.customDomain : d))
      );
      setSuccessMessage(`✓ Domain ${data.customDomain.domain} verified successfully!`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("DNS verification failed. Please try again.");
      }
    } finally {
      setVerifyingId(null);
    }
  };

  const handleSetPrimary = async (id: string) => {
    setSettingPrimaryId(id);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch(`/api/domains/${id}/primary`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to set primary domain.");
      }

      setDomains((prev) =>
        prev.map((d) => ({
          ...d,
          isPrimary: d.id === id,
          status: d.id === id ? "ACTIVE" : d.status,
        }))
      );
      setSuccessMessage(data.message || "Primary domain updated!");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed to update primary domain.");
      }
    } finally {
      setSettingPrimaryId(null);
    }
  };

  const handleDelete = async () => {
    if (!showDeleteModal) return;

    const id = showDeleteModal.id;
    setDeletingId(id);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch(`/api/domains/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to remove domain.");
      }

      setDomains((prev) => prev.filter((d) => d.id !== id));
      setSuccessMessage("✓ Custom domain mapping removed.");
      setShowDeleteModal(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed to remove domain.");
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Messages */}
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

      {/* Add Custom Domain Form */}
      <div className="glass-card p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6 shadow-xl">
        <div className="space-y-1.5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-400" />
            <span>Connect a Custom Domain</span>
          </h2>
          <p className="text-xs text-slate-400">
            Make your portfolio accessible at your own branded web address (e.g.{" "}
            <span className="text-slate-300 font-mono">rajenmandal.com</span> or{" "}
            <span className="text-slate-300 font-mono">www.rajenmandal.com</span>).
          </p>
        </div>

        <form onSubmit={handleAddDomain} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="example.com"
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !newDomain.trim()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50 shrink-0"
          >
            {isSubmitting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            <span>Add Domain</span>
          </button>
        </form>
      </div>

      {/* Connected Domains List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
          Your Connected Domains ({domains.length})
        </h3>

        {domains.length === 0 ? (
          <div className="glass-card p-8 rounded-2xl border border-slate-800 text-center space-y-3">
            <Globe className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">
              No custom domains added yet. Enter your domain above to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {domains.map((item) => {
              const expectedTxtValue = `myfolio-verification=${item.verificationToken}`;
              const txtHostName = `_myfolio.${item.domain}`;

              return (
                <div
                  key={item.id}
                  className="glass-card p-6 rounded-2xl border border-slate-800 space-y-5 shadow-lg relative overflow-hidden"
                >
                  {/* Item Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-indigo-400 shrink-0" />
                      <span className="font-mono font-bold text-base text-white">
                        {item.domain}
                      </span>

                      {item.isPrimary && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold">
                          <Star className="w-3 h-3 fill-indigo-400 text-indigo-400" />
                          <span>Primary</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {item.status === "VERIFIED" || item.status === "ACTIVE" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{item.status === "ACTIVE" ? "Active" : "Verified"}</span>
                        </span>
                      ) : item.status === "FAILED" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Verification Failed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
                          <Clock className="w-3.5 h-3.5 animate-pulse" />
                          <span>Pending Verification</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* DNS Instructions if PENDING or FAILED */}
                  {(item.status === "PENDING" || item.status === "FAILED") && (
                    <div className="space-y-4 bg-slate-950/80 p-5 rounded-xl border border-slate-800 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200 uppercase tracking-wider">
                          Step 1: Domain Ownership Verification (DNS TXT Record)
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          Add this TXT record at your DNS provider (Cloudflare, Namecheap, GoDaddy, etc.)
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
                        <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                          <span className="text-[10px] text-slate-500 font-sans block uppercase font-semibold">
                            Record Type
                          </span>
                          <span className="text-indigo-400 font-bold">TXT</span>
                        </div>

                        <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-500 font-sans block uppercase font-semibold">
                              Name / Host
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(txtHostName, `name-${item.id}`)}
                              className="text-slate-400 hover:text-white"
                            >
                              {copiedText === `name-${item.id}` ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          <span className="text-slate-300 font-bold truncate block">
                            _myfolio
                          </span>
                        </div>

                        <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-500 font-sans block uppercase font-semibold">
                              Value / Content
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(expectedTxtValue, `val-${item.id}`)}
                              className="text-slate-400 hover:text-white"
                            >
                              {copiedText === `val-${item.id}` ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          <span className="text-slate-300 font-bold truncate block">
                            {expectedTxtValue}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CNAME & A Record instructions if VERIFIED / ACTIVE */}
                  {(item.status === "VERIFIED" || item.status === "ACTIVE") && (
                    <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 text-xs">
                      <span className="font-bold text-slate-300 uppercase tracking-wider block">
                        Step 2: Point Domain DNS Traffic to MyFolio
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
                        <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                          <span className="text-[10px] text-slate-500 font-sans block uppercase font-semibold">
                            For Subdomain (e.g. www)
                          </span>
                          <span className="text-slate-300 block">
                            CNAME www ➔ <span className="text-indigo-400 font-bold">{cnameTarget}</span>
                          </span>
                        </div>

                        <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                          <span className="text-[10px] text-slate-500 font-sans block uppercase font-semibold">
                            For Apex / Root Domain (@)
                          </span>
                          <span className="text-slate-300 block">
                            ALIAS / ANAME / CNAME ➔ <span className="text-indigo-400 font-bold">{cnameTarget}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      {(item.status === "PENDING" || item.status === "FAILED") && (
                        <button
                          type="button"
                          disabled={verifyingId === item.id}
                          onClick={() => handleVerify(item.id)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors shadow-md disabled:opacity-50"
                        >
                          {verifyingId === item.id ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Checking DNS...</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-4 h-4" />
                              <span>Verify Domain</span>
                            </>
                          )}
                        </button>
                      )}

                      {(item.status === "VERIFIED" || item.status === "ACTIVE") && (
                        <>
                          <a
                            href={`https://${item.domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-600/30 font-semibold text-xs transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Open Portfolio</span>
                          </a>

                          {!item.isPrimary && (
                            <button
                              type="button"
                              disabled={settingPrimaryId === item.id}
                              onClick={() => handleSetPrimary(item.id)}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-semibold text-xs transition-colors"
                            >
                              {settingPrimaryId === item.id ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Star className="w-3.5 h-3.5 text-amber-400" />
                              )}
                              <span>Set as Primary</span>
                            </button>
                          )}
                        </>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowDeleteModal(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors text-xs font-medium ml-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-2">
        <div className="flex items-center gap-2 font-bold text-slate-300">
          <HelpCircle className="w-4 h-4 text-indigo-400" />
          <span>How DNS Verification & Custom Domains Work</span>
        </div>
        <p className="leading-relaxed">
          1. Add your domain above. We calculate a unique cryptographic DNS verification TXT token for your account.<br />
          2. Add the TXT record at your DNS registrar (Cloudflare, GoDaddy, Namecheap, etc.).<br />
          3. Click <strong>Verify Domain</strong> to run a live server-side DNS check. Once verified, configure your CNAME/ALIAS records to route traffic to MyFolio.
        </p>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 text-rose-400">
                <Trash2 className="w-5 h-5" />
                <span>Remove Custom Domain?</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Are you sure you want to remove{" "}
                <span className="font-mono text-white font-bold">{showDeleteModal.domain}</span>?
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your portfolio will no longer be accessible via this domain. Your profile, projects, skills, experience, and education data will remain safe and accessible via your MyFolio subdomain.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingId === showDeleteModal.id}
                onClick={handleDelete}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all disabled:opacity-50"
              >
                {deletingId === showDeleteModal.id ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Removing...</span>
                  </>
                ) : (
                  <span>Remove Domain</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
