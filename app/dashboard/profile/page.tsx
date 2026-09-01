"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  User,
  MapPin,
  Globe,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Upload,
  ArrowLeft,
  Briefcase,
  FileText,
  Eye,
  EyeOff,
} from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/SocialIcons";

export default function ProfilePage() {
  const router = useRouter();
  const { status: authStatus } = useSession();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    headline: "",
    bio: "",
    location: "",
    website: "",
    github: "",
    linkedin: "",
    email: "",
    phone: "",
    showEmail: false,
    showPhone: false,
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/profile");
        const data = await res.json();

        if (res.ok && data.profile) {
          const p = data.profile;
          setFormData({
            fullName: p.fullName || data.user?.name || "",
            headline: p.headline || "",
            bio: p.bio || "",
            location: p.location || "",
            website: p.website || "",
            github: p.github || "",
            linkedin: p.linkedin || "",
            email: p.email || data.user?.email || "",
            phone: p.phone || "",
            showEmail: p.showEmail ?? false,
            showPhone: p.showPhone ?? false,
          });
        } else if (data.user) {
          setFormData((prev) => ({
            ...prev,
            fullName: data.user.name || "",
            email: data.user.email || "",
          }));
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    }

    if (authStatus === "authenticated") {
      fetchProfile();
    } else if (authStatus === "unauthenticated") {
      router.push("/login");
    }
  }, [authStatus, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setSuccessMsg("");
    setErrorMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save profile");
      }

      setSuccessMsg("✓ Profile saved successfully");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("An unexpected error occurred while saving.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading || authStatus === "loading") {
    return (
      <div className="flex-1 flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
          <span>Loading profile details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Edit Profile
          </h1>
          <p className="text-sm text-slate-400">
            Create and customize the information visible on your public portfolio.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Profile Photo Placeholder */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-base font-semibold text-white">Profile Photo</h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-slate-500 shrink-0">
              <User className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <button
                type="button"
                disabled
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 text-slate-500 border border-slate-700/50 text-sm font-medium cursor-not-allowed opacity-75"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Photo</span>
              </button>
              <p className="text-xs text-slate-500">
                Image upload will be available soon.
              </p>
            </div>
          </div>
        </div>

        {/* General Information */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-5">
          <h2 className="text-base font-semibold text-white border-b border-slate-800/80 pb-3">
            General Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Full Name <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Rajen Mandal"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Professional Headline
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Briefcase className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="headline"
                  value={formData.headline}
                  onChange={handleChange}
                  placeholder="Junior Software Engineer"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Bio
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3.5 flex items-start pointer-events-none text-slate-500">
                <FileText className="w-4 h-4" />
              </div>
              <textarea
                name="bio"
                rows={4}
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell people about yourself, your tech stack, and your passion for software development..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-colors resize-y"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Location
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <MapPin className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Indore, India"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Social Links & Web */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-5">
          <h2 className="text-base font-semibold text-white border-b border-slate-800/80 pb-3">
            Web & Social Links
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Personal Website
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Globe className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://mywebsite.dev"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                GitHub URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <GithubIcon className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  name="github"
                  value={formData.github}
                  onChange={handleChange}
                  placeholder="https://github.com/username"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                LinkedIn URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <LinkedinIcon className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information & Privacy Settings */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-5">
          <h2 className="text-base font-semibold text-white border-b border-slate-800/80 pb-3">
            Contact Information & Visibility
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Contact Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-colors"
                />
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  name="showEmail"
                  checked={formData.showEmail}
                  onChange={handleChange}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="flex items-center gap-1">
                  {formData.showEmail ? (
                    <Eye className="w-3.5 h-3.5 text-indigo-400" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  Display email publicly on portfolio
                </span>
              </label>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Contact Phone
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-colors"
                />
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  name="showPhone"
                  checked={formData.showPhone}
                  onChange={handleChange}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="flex items-center gap-1">
                  {formData.showPhone ? (
                    <Eye className="w-3.5 h-3.5 text-indigo-400" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  Display phone publicly on portfolio
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-800">
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Profile</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
