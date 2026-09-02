"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Globe,
  Trash2,
  AlertTriangle,
} from "lucide-react";

interface DomainItem {
  id: string;
  domain: string;
  status: "PENDING" | "VERIFIED" | "ACTIVE" | "FAILED";
  isPrimary: boolean;
  verifiedAt: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    username: string | null;
    email: string;
  };
}

interface DomainsTableProps {
  domains: DomainItem[];
  total: number;
  page: number;
  totalPages: number;
}

export default function DomainsTable({
  domains,
  total,
  page,
  totalPages,
}: DomainsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");

  const [loadingId, setLoadingId] = useState<string | null>(null);

  const applyFilters = (newSearch?: string, newStatus?: string) => {
    const params = new URLSearchParams();
    const s = newSearch !== undefined ? newSearch : search;
    const st = newStatus !== undefined ? newStatus : status;

    if (s) params.set("search", s);
    if (st) params.set("status", st);
    params.set("page", "1");

    router.push(`/admin/domains?${params.toString()}`);
  };

  const changePage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/admin/domains?${params.toString()}`);
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm("Are you sure you want to set this domain status to FAILED?")) return;
    setLoadingId(id);

    try {
      const res = await fetch(`/api/admin/domains/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "FAILED" }),
      });

      if (!res.ok) throw new Error("Failed to deactivate domain");
      router.refresh();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this domain record permanently?")) return;
    setLoadingId(id);

    try {
      const res = await fetch(`/api/admin/domains/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete domain");
      router.refresh();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search domain or owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              applyFilters(undefined, e.target.value);
            }}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="VERIFIED">VERIFIED</option>
            <option value="PENDING">PENDING</option>
            <option value="FAILED">FAILED</option>
          </select>

          <button
            onClick={() => applyFilters()}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl transition-colors shadow-md shadow-indigo-600/20"
          >
            Search
          </button>
        </div>
      </div>

      {/* Domains Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="p-4">Domain Name</th>
                <th className="p-4">Owner</th>
                <th className="p-4">Status</th>
                <th className="p-4">Primary?</th>
                <th className="p-4">Verified Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {domains.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No custom domains match search criteria.
                  </td>
                </tr>
              ) : (
                domains.map((d) => {
                  const isBusy = loadingId === d.id;
                  return (
                    <tr key={d.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-mono font-semibold text-cyan-400">
                        <div className="flex items-center space-x-2">
                          <Globe className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{d.domain}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-slate-200">{d.user.name || d.user.username || "User"}</p>
                        <p className="text-[11px] text-slate-400">{d.user.email}</p>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-md font-semibold text-[11px] border ${
                            d.status === "ACTIVE" || d.status === "VERIFIED"
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                              : d.status === "PENDING"
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                              : "bg-red-500/20 text-red-400 border-red-500/30"
                          }`}
                        >
                          {d.status}
                        </span>
                      </td>
                      <td className="p-4">
                        {d.isPrimary ? (
                          <span className="text-indigo-400 font-semibold bg-indigo-950/60 border border-indigo-800/60 px-2 py-0.5 rounded text-[11px]">
                            Primary
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">No</span>
                        )}
                      </td>
                      <td className="p-4 text-slate-400">
                        {d.verifiedAt ? new Date(d.verifiedAt).toLocaleDateString() : "Unverified"}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {d.status !== "FAILED" && (
                          <button
                            disabled={isBusy}
                            onClick={() => handleDeactivate(d.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 font-medium text-xs rounded-lg transition-colors border border-amber-800/60"
                          >
                            <AlertTriangle className="w-3 h-3 text-amber-400" />
                            <span>Disable</span>
                          </button>
                        )}

                        <button
                          disabled={isBusy}
                          onClick={() => handleDelete(d.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-950/60 hover:bg-red-900/80 text-red-300 font-medium text-xs rounded-lg transition-colors border border-red-800/60"
                        >
                          <Trash2 className="w-3 h-3 text-red-400" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <span className="font-semibold text-slate-200">{domains.length}</span> of{" "}
            <span className="font-semibold text-slate-200">{total}</span> domains
          </div>
          <div className="flex items-center space-x-2">
            <button
              disabled={page <= 1}
              onClick={() => changePage(page - 1)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-medium text-slate-300">
              Page {page} of {totalPages || 1}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => changePage(page + 1)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
