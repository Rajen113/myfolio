import Link from "next/link";
import { User, CheckCircle2, Globe, ArrowLeft } from "lucide-react";

interface PublicPortfolioPageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function PublicPortfolioPage({ params }: PublicPortfolioPageProps) {
  const { username } = await params;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="max-w-2xl w-full glass-card p-8 sm:p-12 rounded-3xl border border-slate-800 shadow-2xl text-center space-y-8 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-indigo-600/20 blur-3xl rounded-full pointer-events-none" />

        {/* User Icon Badge */}
        <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-xl shadow-indigo-500/20">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-indigo-400">
            <User className="w-10 h-10" />
          </div>
        </div>

        {/* Primary Required Output */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Dynamic Route Active</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Portfolio of: <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">{username}</span>
          </h1>

          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Public portfolio placeholder dynamically rendered for route parameter{" "}
            <code className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-indigo-300 font-mono">
              /{username}
            </code>
          </p>
        </div>

        {/* Information Box */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-left space-y-2 text-xs sm:text-sm text-slate-300">
          <div className="flex items-center gap-2 font-semibold text-slate-200">
            <Globe className="w-4 h-4 text-indigo-400" />
            <span>Architecture Preview:</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            In future steps, this dynamic server route will query PostgreSQL via Prisma for user profile data, customized portfolio templates, skills, and projects based on the username parameter.
          </p>
        </div>

        {/* Action Link */}
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to MyFolio Landing Page</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
