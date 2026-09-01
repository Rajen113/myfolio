import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { User as UserIcon, ArrowLeft, CheckCircle2, Layers } from "lucide-react";

interface PublicPortfolioPageProps {
  params: Promise<{
    username: string;
  }>;
}

// Generate dynamic SEO metadata
export async function generateMetadata({
  params,
}: PublicPortfolioPageProps): Promise<Metadata> {
  const { username } = await params;
  const normalizedUsername = username.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { username: normalizedUsername },
    select: { name: true, username: true },
  });

  if (!user) {
    return {
      title: "Portfolio Not Found | MyFolio",
      description: "The requested portfolio does not exist on MyFolio.",
    };
  }

  const displayName = user.name || user.username || username;
  return {
    title: `${displayName} | MyFolio`,
    description: `Official developer portfolio of ${displayName} hosted on MyFolio.`,
  };
}

export default async function PublicPortfolioPage({
  params,
}: PublicPortfolioPageProps) {
  const { username } = await params;
  const normalizedUsername = username.toLowerCase();

  // Search database for user by username
  const user = await prisma.user.findUnique({
    where: { username: normalizedUsername },
    select: {
      id: true,
      name: true,
      username: true,
      createdAt: true,
    },
  });

  // If user does not exist in database, render 404
  if (!user) {
    notFound();
  }

  const displayName = (user.name || user.username || username).toUpperCase();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="max-w-2xl w-full glass-card p-8 sm:p-12 rounded-3xl border border-slate-800 shadow-2xl text-center space-y-8 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-indigo-600/20 blur-3xl rounded-full pointer-events-none" />

        {/* User Badge */}
        <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-xl shadow-indigo-500/20">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-indigo-400">
            <UserIcon className="w-10 h-10" />
          </div>
        </div>

        {/* Main Required Public Display */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verified Developer Profile</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {displayName}
          </h1>

          <p className="text-xl font-semibold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Portfolio
          </p>

          <p className="text-sm text-slate-400">
            Username: <span className="font-mono text-indigo-300 font-semibold">{user.username}</span>
          </p>
        </div>

        {/* Content Placeholder Info */}
        <div className="p-4 sm:p-6 rounded-2xl bg-slate-950/80 border border-slate-800 text-slate-400 text-xs sm:text-sm space-y-2">
          <div className="flex items-center justify-center gap-2 text-indigo-300 font-semibold">
            <Layers className="w-4 h-4" />
            <span>[Portfolio content will be added in later steps]</span>
          </div>
          <p>
            Skills, featured projects, work experience, education, and customizable themes will populate here.
          </p>
        </div>

        {/* Action Link */}
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to MyFolio</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
