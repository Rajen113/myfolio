"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Mail,
  Eye,
  X,
} from "lucide-react";

interface MessageItem {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  status: "UNREAD" | "READ" | "ARCHIVED";
  createdAt: string;
  user: {
    id: string;
    username: string | null;
    email: string;
  };
}

interface DetailedMessage extends MessageItem {
  message: string;
}

interface MessagesTableProps {
  messages: MessageItem[];
  total: number;
  page: number;
  totalPages: number;
}

export default function MessagesTable({
  messages,
  total,
  page,
  totalPages,
}: MessagesTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");

  const [selectedMessage, setSelectedMessage] = useState<DetailedMessage | null>(null);

  const applyFilters = (newSearch?: string, newStatus?: string) => {
    const params = new URLSearchParams();
    const s = newSearch !== undefined ? newSearch : search;
    const st = newStatus !== undefined ? newStatus : status;

    if (s) params.set("search", s);
    if (st) params.set("status", st);
    params.set("page", "1");

    router.push(`/admin/messages?${params.toString()}`);
  };

  const changePage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/admin/messages?${params.toString()}`);
  };

  const openMessage = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/messages/${id}`);
      if (!res.ok) throw new Error("Failed to load message details");
      const data = await res.json();
      setSelectedMessage(data.message);
    } catch (err) {
      alert((err as Error).message);
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
            placeholder="Search sender, email, subject, or owner..."
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
            <option value="UNREAD">UNREAD</option>
            <option value="READ">READ</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>

          <button
            onClick={() => applyFilters()}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl transition-colors shadow-md shadow-indigo-600/20"
          >
            Search
          </button>
        </div>
      </div>

      {/* Messages Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="p-4">Sender</th>
                <th className="p-4">Recipient Portfolio</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Status</th>
                <th className="p-4">Received</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {messages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No contact messages found.
                  </td>
                </tr>
              ) : (
                messages.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-medium text-slate-100">
                      <p className="font-semibold text-slate-200">{m.name}</p>
                      <p className="text-[11px] text-slate-400">{m.email}</p>
                    </td>
                    <td className="p-4 font-mono text-indigo-400">
                      {m.user.username ? `@${m.user.username}` : m.user.email}
                    </td>
                    <td className="p-4 font-medium text-slate-200 max-w-xs truncate">
                      {m.subject || "(No subject)"}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md font-semibold text-[11px] border ${
                          m.status === "UNREAD"
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse"
                            : "bg-slate-800 text-slate-400 border-slate-700"
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => openMessage(m.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg transition-colors shadow-md shadow-indigo-600/20"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <span className="font-semibold text-slate-200">{messages.length}</span> of{" "}
            <span className="font-semibold text-slate-200">{total}</span> messages
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

      {/* Message Inspection Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-indigo-400">
                <Mail className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Contact Message Details</h3>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">From:</span>
                  <span className="font-semibold text-white">{selectedMessage.name} &lt;{selectedMessage.email}&gt;</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Portfolio Owner:</span>
                  <span className="font-mono text-indigo-400">@{selectedMessage.user.username || selectedMessage.user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Date:</span>
                  <span>{new Date(selectedMessage.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px] block mb-1">Subject:</span>
                <p className="font-bold text-white bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                  {selectedMessage.subject || "(No subject)"}
                </p>
              </div>

              <div>
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px] block mb-1">Message Body:</span>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-sans text-slate-200 text-xs whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                  {selectedMessage.message}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedMessage(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
