"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { LogOut, Loader2 } from "lucide-react";

interface LogoutButtonProps {
  className?: string;
  variant?: "default" | "outline" | "text";
}

export default function LogoutButton({
  className = "",
  variant = "default",
}: LogoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await signOut({ callbackUrl: "/login" });
  };

  let baseStyles =
    "inline-flex items-center justify-center gap-2 text-sm font-semibold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50";

  if (variant === "default") {
    baseStyles +=
      " px-4 py-2.5 bg-rose-600/90 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20";
  } else if (variant === "outline") {
    baseStyles +=
      " px-3.5 py-2 border border-slate-700/80 hover:border-slate-600 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white";
  } else if (variant === "text") {
    baseStyles += " px-3 py-1.5 text-slate-400 hover:text-rose-400";
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={`${baseStyles} ${className}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        <LogOut className="w-4 h-4 text-current" />
      )}
      <span>{loading ? "Logging out..." : "Logout"}</span>
    </button>
  );
}
