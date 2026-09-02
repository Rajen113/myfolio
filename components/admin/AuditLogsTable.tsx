"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";

interface AuditLogItem {
  id: string;
  action: string;
  targetType: string;
  targetId: string | null;
  metadata: string | null;
  createdAt: string;
  adminUser: {
    id: string;
    name: string | null;
    email: string;
    username: string | null;
  };
}

interface AuditLogsTableProps {
  logs: AuditLogItem[];
  total: number;
  page: number;
  totalPages: number;
}

export default function AuditLogsTable({
  logs,
  total,
  page,
  totalPages,
}: AuditLogsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [actionFilter, setActionFilter] = useState(searchParams.get("action") || "");

  const applyFilters = (newAction?: string) => {
    const params = new URLSearchParams();
    const act = newAction !== undefined ? newAction : actionFilter;

    if (act) params.set("action", act);
    params.set("page", "1");

    router.push(`/admin/audit-logs?${params.toString()}`);
  };

  const changePage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/admin/audit-logs?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      {/* Action Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
        <div className="flex items-center space-x-2 text-slate-300 text-xs">
          <ShieldAlert className="w-4 h-4 text-purple-400" />
          <span className="font-semibold">Filter Administrative Actions</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              applyFilters(e.target.value);
            }}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3.5 py-2 outline-none focus:border-indigo-500"
          >
            <option value="">All Audit Actions</option>
            <option value="USER_SUSPENDED">USER_SUSPENDED</option>
            <option value="USER_REACTIVATED">USER_REACTIVATED</option>
            <option value="PORTFOLIO_PUBLISHED">PORTFOLIO_PUBLISHED</option>
            <option value="PORTFOLIO_UNPUBLISHED">PORTFOLIO_UNPUBLISHED</option>
            <option value="DOMAIN_DEACTIVATED">DOMAIN_DEACTIVATED</option>
            <option value="DOMAIN_STATUS_UPDATED">DOMAIN_STATUS_UPDATED</option>
            <option value="DOMAIN_DELETED">DOMAIN_DELETED</option>
            <option value="MESSAGE_VIEWED">MESSAGE_VIEWED</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="p-4">Timestamp</th>
                <th className="p-4">Admin</th>
                <th className="p-4">Action</th>
                <th className="p-4">Target</th>
                <th className="p-4">Details / Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No administrative audit logs recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 whitespace-nowrap text-slate-400 font-mono">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-slate-200">{log.adminUser.name || log.adminUser.username || "Admin"}</p>
                      <p className="text-[11px] text-slate-400">{log.adminUser.email}</p>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-xs font-semibold text-purple-300 bg-purple-950/60 border border-purple-800/60 px-2.5 py-1 rounded-md inline-block">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-slate-300">{log.targetType}</span>
                      {log.targetId && (
                        <p className="text-[10px] font-mono text-slate-500 truncate max-w-[120px]">
                          ID: {log.targetId}
                        </p>
                      )}
                    </td>
                    <td className="p-4 max-w-sm">
                      {log.metadata ? (
                        <pre className="font-mono text-[11px] text-slate-400 bg-slate-950/80 border border-slate-800/80 p-2 rounded-lg overflow-x-auto whitespace-pre-wrap">
                          {log.metadata}
                        </pre>
                      ) : (
                        <span className="text-slate-600 text-[11px]">—</span>
                      )}
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
            Showing <span className="font-semibold text-slate-200">{logs.length}</span> of{" "}
            <span className="font-semibold text-slate-200">{total}</span> audit records
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
