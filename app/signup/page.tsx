"use client";

import Link from "next/link";
import { UserPlus, Mail, Lock, AtSign } from "lucide-react";

export default function SignupPage() {
  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 glass-card p-8 rounded-2xl border border-slate-800 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Create Your MyFolio Account
          </h2>
          <p className="text-sm text-slate-400">
            Claim your custom portfolio username today
          </p>
        </div>

        {/* Signup Form Placeholder */}
        <form className="mt-8 space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <AtSign className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  disabled
                  placeholder="rajenmandal"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 text-sm cursor-not-allowed opacity-80"
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">Your profile URL will be myfolio.com/[username]</p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  disabled
                  placeholder="you@domain.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 text-sm cursor-not-allowed opacity-80"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  disabled
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 text-sm cursor-not-allowed opacity-80"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 opacity-90 cursor-default shadow-md shadow-purple-500/20"
          >
            Create Account Placeholder
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800 text-sm text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
