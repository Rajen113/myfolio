"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Globe,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface PortfolioItem {
  id: string;
  template: string;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    username: string | null;
    email: string;
  };
  _count: {
    viewEvents: number;
    contactMessages: number;
  };
}

interface PortfoliosTableProps {
  portfolios: PortfolioItem[];
  total: number;
  page: number;
  totalPages: number;
}

export default function PortfoliosTable({
  portfolios,
  total,
  page,
  totalPages,
}: PortfoliosTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [published, setPublished] = useState(searchParams.get("published") || "");

  const [loadingId, setLoadingId] = useState<string | null>(null);

  const applyFilters = (newSearch?: string, newPublished?: string) => {
    const params = new URLSearchParams();
    const s = newSearch !== undefined ? newSearch : search;
    const p = newPublished !== undefined ? newPublished : published;

    if (s) params.set("search", s);
    if (p) params.set("published", p);
    params.set("page", "1");

    router.push(`/admin/portfolios?${params.toString()}`);
  };

  const changePage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/admin/portfolios?${params.toString()}`);
  };

  const togglePublish = async (portfolioId: string, currentPublished: boolean) => {
    setLoadingId(portfolioId);
    const endpoint = currentPublished ? "unpublish" : "publish";

    try {
      const res = await fetch(`/api/admin/portfolios/${portfolioId}/${endpoint}`, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to update portfolio publication status");
      }

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
            placeholder="Search by owner name or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={published}
            onChange={(e) => {
              setPublished(e.target.value);
              applyFilters(undefined, e.target.value);
            }}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="true">Published</option>
            <option value="false">Unpublished (Draft)</option>
          </select>

          <button
            onClick={() => applyFilters()}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl transition-colors shadow-md shadow-indigo-600/20"
          >
            Search
          </button>
        </div>
      </div>

      {/* Portfolios Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="p-4">Owner</th>
                <th className="p-4">Username URL</th>
                <th className="p-4">Template</th>
                <th className="p-4">Status</th>
                <th className="p-4">Views</th>
                <th className="p-4">Last Updated</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {portfolios.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No portfolios match search criteria.
                  </td>
                </tr>
              ) : (
                portfolios.map((p) => {
                  const isBusy = loadingId === p.id;
                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-medium text-slate-100">
                        <p className="font-semibold text-slate-200">{p.user.name || "No name"}</p>
                        <p className="text-[11px] text-slate-400">{p.user.email}</p>
                      </td>
                      <td className="p-4 font-mono text-indigo-400">
                        {p.user.username ? `@${p.user.username}` : "—"}
                      </td>
                      <td className="p-4 font-semibold text-slate-300">{p.template}</td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold text-[11px] ${
                            p.isPublished
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-slate-800 text-slate-400 border border-slate-700"
                          }`}
                        >
                          {p.isPublished ? (
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <XCircle className="w-3 h-3 text-slate-500" />
                          )}
                          {p.isPublished ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-slate-200">
                        {p._count.viewEvents.toLocaleString()}
                      </td>
                      <td className="p-4 text-slate-400">
                        {new Date(p.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {p.isPublished && p.user.username && (
                          <a
                            href={`/${p.user.username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-lg transition-colors border border-slate-700"
                          >
                            <Globe className="w-3 h-3 text-indigo-400" />
                            <span>View Public</span>
                          </a>
                        )}

                        <button
                          disabled={isBusy}
                          onClick={() => togglePublish(p.id, p.isPublished)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 font-medium text-xs rounded-lg transition-colors border ${
                            p.isPublished
                              ? "bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border-amber-800/60"
                              : "bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border-emerald-800/60"
                          }`}
                        >
                          {isBusy ? "Updating..." : p.isPublished ? "Unpublish" : "Publish"}
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
            Showing <span className="font-semibold text-slate-200">{portfolios.length}</span> of{" "}
            <span className="font-semibold text-slate-200">{total}</span> portfolios
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
