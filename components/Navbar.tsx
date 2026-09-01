import Link from "next/link";
import { Sparkles, LayoutDashboard, User, LogIn } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            MyFolio
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <Link
            href="/"
            className="hover:text-white transition-colors"
          >
            Home
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 text-indigo-400" />
            Dashboard
          </Link>
          <Link
            href="/rajenmandal"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <User className="w-4 h-4 text-purple-400" />
            Demo Profile
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-slate-800/60"
          >
            <LogIn className="w-4 h-4" />
            Login
          </Link>

          <Link
            href="/signup"
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all active:scale-[0.98]"
          >
            Create Portfolio
          </Link>
        </div>
      </div>
    </header>
  );
}
