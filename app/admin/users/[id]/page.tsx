import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Shield,
  Briefcase,
  Globe,
  Eye,
  Layers,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const targetUser = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      profile: true,
      portfolioSettings: {
        select: {
          id: true,
          template: true,
          isPublished: true,
          publishedAt: true,
          updatedAt: true,
        },
      },
      customDomains: {
        select: {
          id: true,
          domain: true,
          status: true,
          isPrimary: true,
          verifiedAt: true,
          createdAt: true,
        },
      },
      _count: {
        select: {
          projects: true,
          skills: true,
          experience: true,
          education: true,
          customDomains: true,
          contactMessages: true,
          portfolioViewEvents: true,
        },
      },
    },
  });

  if (!targetUser) {
    notFound();
  }

  // Calculate profile completion score
  const p = targetUser.profile;
  const profileFields = [
    p?.fullName,
    p?.headline,
    p?.bio,
    p?.profileImage,
    p?.location,
    p?.github || p?.linkedin || p?.website,
  ];
  const filledFields = profileFields.filter(Boolean).length;
  const profileCompletion = Math.round((filledFields / profileFields.length) * 100);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/users"
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>{targetUser.name || targetUser.email}</span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                  targetUser.status === "ACTIVE"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    : "bg-red-500/20 text-red-300 border-red-500/30"
                }`}
              >
                {targetUser.status}
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              User ID: <span className="font-mono text-slate-300">{targetUser.id}</span>
            </p>
          </div>
        </div>

        {targetUser.portfolioSettings?.isPublished && targetUser.username && (
          <a
            href={`/${targetUser.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl transition-colors shadow-lg shadow-indigo-600/20"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Public Portfolio</span>
          </a>
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Identity Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <div className="w-12 h-12 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-bold flex items-center justify-center text-lg">
              {(targetUser.name || targetUser.email).substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-white text-base">{targetUser.name || "No name set"}</h3>
              <p className="text-xs text-slate-400">{targetUser.email}</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">Username:</span>
              <span className="font-mono text-slate-200">{targetUser.username ? `@${targetUser.username}` : "Not set"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Role:</span>
              <span className="font-semibold text-purple-300 flex items-center gap-1">
                {targetUser.role === "ADMIN" && <Shield className="w-3 h-3 text-purple-400" />}
                {targetUser.role}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Joined:</span>
              <span className="text-slate-300">{new Date(targetUser.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Profile Completion:</span>
              <span className="font-semibold text-emerald-400">{profileCompletion}%</span>
            </div>
          </div>
        </div>

        {/* Portfolio Status Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-400" />
              <span>Portfolio Details</span>
            </h3>
            {targetUser.portfolioSettings?.isPublished ? (
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                Published
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                Draft
              </span>
            )}
          </div>

          <div className="space-y-2.5 text-xs text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">Template:</span>
              <span className="font-semibold text-slate-200">{targetUser.portfolioSettings?.template || "MODERN"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Views:</span>
              <span className="font-bold text-indigo-400">{targetUser._count.portfolioViewEvents.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Contact Messages:</span>
              <span className="font-semibold text-slate-200">{targetUser._count.contactMessages}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Last Published:</span>
              <span className="text-slate-300">
                {targetUser.portfolioSettings?.publishedAt
                  ? new Date(targetUser.portfolioSettings.publishedAt).toLocaleDateString()
                  : "Never"}
              </span>
            </div>
          </div>
        </div>

        {/* Content Counts Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <span>Content Breakdown</span>
          </h3>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
              <p className="text-xl font-bold text-white">{targetUser._count.projects}</p>
              <p className="text-[11px] text-slate-400">Projects</p>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
              <p className="text-xl font-bold text-white">{targetUser._count.skills}</p>
              <p className="text-[11px] text-slate-400">Skills</p>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
              <p className="text-xl font-bold text-white">{targetUser._count.experience}</p>
              <p className="text-[11px] text-slate-400">Experience</p>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
              <p className="text-xl font-bold text-white">{targetUser._count.education}</p>
              <p className="text-[11px] text-slate-400">Education</p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Domains Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span>Configured Custom Domains ({targetUser.customDomains.length})</span>
        </h3>

        {targetUser.customDomains.length === 0 ? (
          <p className="text-xs text-slate-500 py-4">No custom domains configured by this user.</p>
        ) : (
          <div className="divide-y divide-slate-800">
            {targetUser.customDomains.map((domain) => (
              <div key={domain.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-mono font-semibold text-slate-200">{domain.domain}</p>
                  <p className="text-[11px] text-slate-500">Added {new Date(domain.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center space-x-3">
                  {domain.isPrimary && (
                    <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] px-2 py-0.5 rounded font-semibold">
                      Primary
                    </span>
                  )}
                  <span
                    className={`font-semibold px-2.5 py-0.5 rounded text-[11px] ${
                      domain.status === "ACTIVE" || domain.status === "VERIFIED"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {domain.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
