"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Globe,
  Mail,
  BarChart3,
  ShieldAlert,
  ArrowLeft,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Portfolios", href: "/admin/portfolios", icon: Briefcase },
  { name: "Custom Domains", href: "/admin/domains", icon: Globe },
  { name: "Contact Messages", href: "/admin/messages", icon: Mail },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Audit Logs", href: "/admin/audit-logs", icon: ShieldAlert },
];

export default function AdminSidebar({
  adminName,
  adminEmail,
}: {
  adminName?: string;
  adminEmail?: string;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden flex items-center justify-between bg-slate-900 text-white p-4 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-6 h-6 text-indigo-400" />
          <span className="font-bold tracking-wide">MyFolio Admin</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-slate-300 hover:text-white rounded-lg focus:outline-none"
          aria-label="Toggle Navigation"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static top-0 left-0 bottom-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          {/* Header Branding */}
          <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950/50">
            <Link href="/admin" className="flex items-center space-x-3 text-white font-bold text-lg">
              <div className="p-1.5 rounded-lg bg-indigo-600/30 text-indigo-400 border border-indigo-500/30">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <span>MyFolio Admin</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer / User Profile & Exit to User Dashboard */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center space-x-3 px-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 font-semibold flex items-center justify-center text-xs">
              {(adminName || adminEmail || "A").substring(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-200 truncate">{adminName || "Administrator"}</p>
              <p className="text-[11px] text-slate-400 truncate">{adminEmail || "admin@myfolio.com"}</p>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 rounded-lg transition-colors border border-slate-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>User Dashboard</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
