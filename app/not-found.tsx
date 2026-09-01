import Link from "next/link";
import { UserX, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="max-w-md w-full glass-card p-8 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl text-center space-y-6 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-rose-600/15 blur-3xl rounded-full pointer-events-none" />

        <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
          <UserX className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Portfolio not found
          </h1>
          <p className="text-sm text-slate-400">
            The portfolio you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to MyFolio</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
