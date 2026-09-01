"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  FolderGit2,
  Wrench,
  Briefcase,
  GraduationCap,
  LayoutTemplate,
  Palette,
  Globe,
  Settings,
} from "lucide-react";

export default function DashboardNav() {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
      disabled: false,
    },
    {
      label: "Profile",
      href: "/dashboard/profile",
      icon: User,
      active: pathname.startsWith("/dashboard/profile"),
      disabled: false,
    },
    {
      label: "Projects",
      href: "/dashboard/projects",
      icon: FolderGit2,
      active: pathname.startsWith("/dashboard/projects"),
      disabled: false,
    },
    {
      label: "Skills",
      href: "/dashboard/skills",
      icon: Wrench,
      active: pathname.startsWith("/dashboard/skills"),
      disabled: false,
    },
    {
      label: "Experience",
      href: "/dashboard/experience",
      icon: Briefcase,
      active: pathname.startsWith("/dashboard/experience"),
      disabled: false,
    },
    {
      label: "Education",
      href: "/dashboard/education",
      icon: GraduationCap,
      active: pathname.startsWith("/dashboard/education"),
      disabled: false,
    },
    {
      label: "Templates",
      href: "/dashboard/templates",
      icon: LayoutTemplate,
      active: pathname.startsWith("/dashboard/templates"),
      disabled: false,
    },
    {
      label: "Customize",
      href: "/dashboard/customize",
      icon: Palette,
      active: pathname.startsWith("/dashboard/customize"),
      disabled: false,
    },
    {
      label: "Domains",
      href: "/dashboard/domains",
      icon: Globe,
      active: pathname.startsWith("/dashboard/domains"),
      disabled: false,
    },
    {
      label: "Settings",
      href: "#",
      icon: Settings,
      active: false,
      disabled: true,
    },
  ];

  return (
    <div className="w-full border-b border-slate-800 bg-slate-950/40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            if (item.disabled) {
              return (
                <span
                  key={item.label}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 cursor-not-allowed select-none whitespace-nowrap"
                  title="Coming soon"
                >
                  <Icon className="w-4 h-4 text-slate-700" />
                  <span>{item.label}</span>
                </span>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                  item.active
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-900/80"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    item.active ? "text-indigo-400" : "text-slate-500"
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
