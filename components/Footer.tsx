import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-400 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-semibold text-slate-200 text-sm">
            MyFolio &copy; {new Date().getFullYear()} — Professional Portfolio Platform
          </span>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <Link href="/" className="hover:text-slate-200 transition-colors">
            Home
          </Link>
          <Link href="/login" className="hover:text-slate-200 transition-colors">
            Login
          </Link>
          <Link href="/signup" className="hover:text-slate-200 transition-colors">
            Sign Up
          </Link>
          <Link href="/dashboard" className="hover:text-slate-200 transition-colors">
            Dashboard
          </Link>
        </div>
      </div>
    </footer>
  );
}
