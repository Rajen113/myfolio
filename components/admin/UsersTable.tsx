"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Shield,
  UserCheck,
  UserX,
  Eye,
  AlertTriangle,
} from "lucide-react";

interface UserItem {
  id: string;
  name: string | null;
  email: string;
  username: string | null;
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED";
  createdAt: string;
  portfolioSettings: {
    isPublished: boolean;
    template: string;
  } | null;
  _count: {
    projects: number;
    skills: number;
    customDomains: number;
  };
}

interface UsersTableProps {
  users: UserItem[];
  total: number;
  page: number;
  totalPages: number;
  currentAdminId: string;
}

export default function UsersTable({
  users,
  total,
  page,
  totalPages,
  currentAdminId,
}: UsersTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [role, setRole] = useState(searchParams.get("role") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");

  // Modal State for Account Actions
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [actionType, setActionType] = useState<"SUSPEND" | "REACTIVATE" | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const applyFilters = (newSearch?: string, newRole?: string, newStatus?: string) => {
    const params = new URLSearchParams();
    const s = newSearch !== undefined ? newSearch : search;
    const r = newRole !== undefined ? newRole : role;
    const st = newStatus !== undefined ? newStatus : status;

    if (s) params.set("search", s);
    if (r) params.set("role", r);
    if (st) params.set("status", st);
    params.set("page", "1");

    router.push(`/admin/users?${params.toString()}`);
  };

  const changePage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/admin/users?${params.toString()}`);
  };

  const handleStatusChange = async () => {
    if (!selectedUser || !actionType) return;
    setLoading(true);
    setErrorMsg(null);

    const targetStatus = actionType === "SUSPEND" ? "SUSPENDED" : "ACTIVE";

    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: targetStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update user status");
      }

      setSelectedUser(null);
      setActionType(null);
      router.refresh();
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setLoading(false);
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
            placeholder="Search by name, username, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              applyFilters(undefined, e.target.value, undefined);
            }}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500"
          >
            <option value="">All Roles</option>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              applyFilters(undefined, undefined, e.target.value);
            }}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="SUSPENDED">SUSPENDED</option>
          </select>

          <button
            onClick={() => applyFilters()}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl transition-colors shadow-md shadow-indigo-600/20"
          >
            Search
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="p-4">User</th>
                <th className="p-4">Username</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Portfolio</th>
                <th className="p-4">Joined</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No users matching search criteria.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isSelf = u.id === currentAdminId;
                  const isSuspended = u.status === "SUSPENDED";
                  return (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-medium text-slate-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-semibold flex items-center justify-center text-xs">
                            {(u.name || u.email || "U").substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-200">{u.name || "No name"}</p>
                            <p className="text-[11px] text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-slate-400">
                        {u.username ? `@${u.username}` : "—"}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold text-[11px] ${
                            u.role === "ADMIN"
                              ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                              : "bg-slate-800 text-slate-300 border border-slate-700"
                          }`}
                        >
                          {u.role === "ADMIN" && <Shield className="w-3 h-3 text-purple-400" />}
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold text-[11px] ${
                            isSuspended
                              ? "bg-red-500/20 text-red-400 border border-red-500/30"
                              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          }`}
                        >
                          {isSuspended ? (
                            <UserX className="w-3 h-3 text-red-400" />
                          ) : (
                            <UserCheck className="w-3 h-3 text-emerald-400" />
                          )}
                          {u.status}
                        </span>
                      </td>
                      <td className="p-4">
                        {u.portfolioSettings?.isPublished ? (
                          <span className="text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded text-[11px]">
                            Published ({u.portfolioSettings.template})
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Draft</span>
                        )}
                      </td>
                      <td className="p-4 text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <Link
                          href={`/admin/users/${u.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-lg transition-colors border border-slate-700"
                        >
                          <Eye className="w-3 h-3 text-slate-400" />
                          <span>View</span>
                        </Link>

                        {!isSelf && (
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setActionType(isSuspended ? "REACTIVATE" : "SUSPEND");
                              setErrorMsg(null);
                            }}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 font-medium text-xs rounded-lg transition-colors border ${
                              isSuspended
                                ? "bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border-emerald-800/60"
                                : "bg-red-950/60 hover:bg-red-900/80 text-red-300 border-red-800/60"
                            }`}
                          >
                            {isSuspended ? "Reactivate" : "Suspend"}
                          </button>
                        )}
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
            Showing <span className="font-semibold text-slate-200">{users.length}</span> of{" "}
            <span className="font-semibold text-slate-200">{total}</span> users
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

      {/* Account Action Confirmation Modal */}
      {selectedUser && actionType && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-amber-400">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Confirm Account {actionType === "SUSPEND" ? "Suspension" : "Reactivation"}
              </h3>
            </div>

            <p className="text-sm text-slate-300">
              Are you sure you want to {actionType.toLowerCase()}{" "}
              <strong className="text-white">{selectedUser.name || selectedUser.email}</strong>?
            </p>

            {actionType === "SUSPEND" && (
              <p className="text-xs text-red-400 bg-red-950/40 border border-red-900/60 p-3 rounded-xl">
                ⚠️ Suspended users cannot log in or manage their portfolio until reactivated by an admin.
              </p>
            )}

            {errorMsg && (
              <p className="text-xs text-red-400 bg-red-900/20 border border-red-800/40 p-2.5 rounded-lg">
                {errorMsg}
              </p>
            )}

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                disabled={loading}
                onClick={() => {
                  setSelectedUser(null);
                  setActionType(null);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={loading}
                onClick={handleStatusChange}
                className={`px-4 py-2 font-medium text-xs text-white rounded-xl transition-colors shadow-lg ${
                  actionType === "SUSPEND"
                    ? "bg-red-600 hover:bg-red-500 shadow-red-600/20"
                    : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20"
                }`}
              >
                {loading
                  ? "Processing..."
                  : actionType === "SUSPEND"
                  ? "Suspend Account"
                  : "Reactivate Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
