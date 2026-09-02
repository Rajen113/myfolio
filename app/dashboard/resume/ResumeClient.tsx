"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Download,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sparkles,
  Layout,
  Edit3,
} from "lucide-react";
import { ResumeData } from "@/lib/resume/types";

interface ResumeClientProps {
  initialData: ResumeData;
}

export default function ResumeClient({ initialData }: ResumeClientProps) {
  const [data, setData] = useState<ResumeData>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { settings, profile, skills, experience, education, projects, socialLinks } = data;

  // Profile completeness checks
  const missingFields: string[] = [];
  if (!profile.summary) missingFields.push("Professional summary");
  if (experience.length === 0) missingFields.push("Experience");
  if (education.length === 0) missingFields.push("Education");
  if (skills.length === 0) missingFields.push("Skills");

  // Save updated settings to backend
  const updateSettings = async (
    updates: Partial<ResumeData["settings"]>
  ) => {
    const newSettings = { ...settings, ...updates };
    setData((prev) => ({ ...prev, settings: newSettings }));
    setIsSaving(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/resume/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        const err = await res.json();
        setErrorMsg(err.error || "Failed to save resume settings");
      }
    } catch (err) {
      console.error("Save resume settings error:", err);
      setErrorMsg("Network error saving settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (isGeneratingPDF) return;
    setIsGeneratingPDF(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/resume/pdf");
      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Extract filename from header or fallback
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = "Resume.pdf";
      if (contentDisposition && contentDisposition.includes("filename=")) {
        filename = contentDisposition
          .split("filename=")[1]
          .replace(/"/g, "")
          .trim();
      }

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF generation error:", err);
      setErrorMsg("Failed to download PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* HEADER & TOP ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            <span>Smart Resume Builder</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <span>Resume Builder</span>
            {isSaving && (
              <span className="text-xs text-slate-400 font-normal flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-400">
            Generate and download a clean, ATS-friendly PDF resume using your existing MyFolio profile data.
          </p>
        </div>

        {/* Download PDF Button */}
        <button
          type="button"
          onClick={handleDownloadPDF}
          disabled={isGeneratingPDF}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900/60 disabled:cursor-not-allowed text-white text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all self-start md:self-center"
        >
          {isGeneratingPDF ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating PDF...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </>
          )}
        </button>
      </div>

      {/* ERROR BANNER */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* PROFILE COMPLETENESS WARNING */}
      {missingFields.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-200">
              Your resume is missing some information.
            </p>
            <p className="text-amber-300/80">
              Consider completing: {missingFields.join(" • ")}
            </p>
            <div className="pt-1">
              <Link
                href="/dashboard/profile"
                className="inline-flex items-center gap-1 text-indigo-400 font-bold hover:underline"
              >
                <span>Edit Profile & Data</span>
                <Edit3 className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* MAIN SPLIT CONTROLS & PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT PANEL: CONTROLS & SETTINGS (4 Columns) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Template Selection */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Layout className="w-4 h-4 text-indigo-400" />
              <span>Resume Template</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {(
                [
                  {
                    id: "PROFESSIONAL",
                    name: "Professional",
                    desc: "Recruiter-friendly traditional layout, strong ATS score.",
                  },
                  {
                    id: "MODERN",
                    name: "Modern",
                    desc: "Slight accent styling with clear visual hierarchy.",
                  },
                  {
                    id: "MINIMAL",
                    name: "Minimal",
                    desc: "Compact, content-first layout with clean typography.",
                  },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => updateSettings({ template: t.id })}
                  className={`p-3.5 rounded-xl text-left border transition-all ${
                    settings.template === t.id
                      ? "bg-indigo-600/15 border-indigo-500 text-white ring-1 ring-indigo-500/30"
                      : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{t.name}</span>
                    {settings.template === t.id && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    {t.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Section Visibility Toggles */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Visible Sections</span>
            </div>

            <div className="space-y-3">
              {[
                { key: "showSummary", label: "Summary / Bio", count: profile.summary ? 1 : 0 },
                { key: "showExperience", label: "Experience", count: experience.length },
                { key: "showEducation", label: "Education", count: education.length },
                { key: "showSkills", label: "Skills", count: skills.length },
                { key: "showProjects", label: "Projects", count: projects.length },
                { key: "showSocialLinks", label: "Social Links", count: socialLinks.length },
              ].map(({ key, label, count }) => {
                const isChecked = Boolean(settings[key as keyof typeof settings]);

                return (
                  <label
                    key={key}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer hover:bg-slate-900 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) =>
                          updateSettings({ [key]: e.target.checked })
                        }
                        className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
                      />
                      <span className="text-xs font-medium text-slate-200">
                        {label}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                      {count}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: LIVE RESUME PREVIEW (8 Columns) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Live Preview ({settings.template})</span>
            </h2>

            <span className="text-xs text-slate-500 font-mono">A4 Format</span>
          </div>

          {/* HTML / CSS LIVE PREVIEW CONTAINER */}
          <div className="w-full overflow-x-auto bg-slate-950 p-4 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl">
            <div className="min-w-[600px] max-w-[800px] mx-auto bg-white text-slate-900 p-8 sm:p-12 rounded-lg shadow-xl font-sans text-xs space-y-6">
              {/* PREVIEW TEMPLATE RENDERER */}
              <ResumeHTMLPreview data={data} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * HTML/CSS Live Preview Component mirroring the React PDF output
 */
function ResumeHTMLPreview({ data }: { data: ResumeData }) {
  const { profile, socialLinks, skills, experience, education, projects, settings } = data;

  const template = settings.template;
  const showSummary = settings.showSummary && Boolean(profile.summary);
  const showSkills = settings.showSkills && skills.length > 0;
  const showExperience = settings.showExperience && experience.length > 0;
  const showEducation = settings.showEducation && education.length > 0;
  const showProjects = settings.showProjects && projects.length > 0;
  const showSocial = settings.showSocialLinks && socialLinks.length > 0;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div
        className={`pb-4 ${
          template === "MODERN"
            ? "border-t-4 border-blue-500 pt-2"
            : "border-b border-slate-300"
        }`}
      >
        <h1
          className={`text-2xl font-bold uppercase tracking-tight ${
            template === "MODERN" ? "text-slate-900" : "text-slate-900"
          }`}
        >
          {profile.name}
        </h1>

        {profile.headline && (
          <p
            className={`text-xs font-semibold mt-1 ${
              template === "MODERN" ? "text-blue-600" : "text-blue-600"
            }`}
          >
            {profile.headline}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600 mt-2">
          {profile.email && <span>{profile.email}</span>}
          {profile.phone && <span>• {profile.phone}</span>}
          {profile.location && <span>• {profile.location}</span>}
          {profile.website && (
            <span className="text-blue-600 font-medium">
              • {profile.website.replace(/^https?:\/\//, "")}
            </span>
          )}
          {showSocial &&
            socialLinks.map((s, idx) => (
              <span key={idx} className="text-blue-600 font-medium">
                • {s.platform}
              </span>
            ))}
        </div>
      </div>

      {/* SUMMARY */}
      {showSummary && profile.summary && (
        <div className="space-y-1.5">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-900 pb-0.5">
            Summary
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
            {profile.summary}
          </p>
        </div>
      )}

      {/* EXPERIENCE */}
      {showExperience && (
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-900 pb-0.5">
            Experience
          </h2>
          {experience.map((exp) => (
            <div key={exp.id} className="space-y-1">
              <div className="flex items-baseline justify-between">
                <span className="font-bold text-slate-900">{exp.position}</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(exp.startDate).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  –{" "}
                  {exp.current
                    ? "Present"
                    : exp.endDate
                    ? new Date(exp.endDate).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })
                    : ""}
                </span>
              </div>
              <p className="text-xs italic text-slate-600">
                {exp.company} {exp.location ? `| ${exp.location}` : ""}
              </p>
              {exp.description && (
                <p className="text-xs text-slate-700 leading-relaxed">
                  {exp.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* EDUCATION */}
      {showEducation && (
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-900 pb-0.5">
            Education
          </h2>
          {education.map((edu) => (
            <div key={edu.id} className="space-y-1">
              <div className="flex items-baseline justify-between">
                <span className="font-bold text-slate-900">
                  {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(edu.startDate).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  –{" "}
                  {edu.current
                    ? "Present"
                    : edu.endDate
                    ? new Date(edu.endDate).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })
                    : ""}
                </span>
              </div>
              <p className="text-xs italic text-slate-600">
                {edu.institution} {edu.location ? `| ${edu.location}` : ""}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* SKILLS */}
      {showSkills && (
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-900 pb-0.5">
            Skills
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((s) => (
              <span
                key={s.id}
                className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[11px] font-medium text-slate-800"
              >
                {s.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* PROJECTS */}
      {showProjects && (
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-900 pb-0.5">
            Projects
          </h2>
          {projects.map((proj) => (
            <div key={proj.id} className="space-y-1">
              <div className="flex items-baseline justify-between">
                <span className="font-bold text-slate-900">{proj.title}</span>
                {proj.liveUrl && (
                  <span className="text-[10px] text-blue-600 font-medium">
                    Live Demo
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {proj.description}
              </p>
              {proj.technologies && proj.technologies.length > 0 && (
                <p className="text-[11px] text-slate-500">
                  Tech: {proj.technologies.join(", ")}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
