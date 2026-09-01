"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  PORTFOLIO_TEMPLATES,
  TemplateValue,
} from "@/lib/constants/portfolio-templates";
import {
  LayoutTemplate,
  CheckCircle2,
  Eye,
  Loader2,
  Sparkles,
  X,
  Check,
  AlertCircle,
} from "lucide-react";
import PortfolioRenderer from "@/components/portfolio/PortfolioRenderer";
import { PortfolioData } from "@/types/portfolio";

interface TemplateSelectionClientProps {
  initialTemplate: TemplateValue;
}

// Clean mock portfolio data for live template previews
const MOCK_PORTFOLIO_DATA: PortfolioData = {
  username: "alexdev",
  name: "Alex Morgan",
  profile: {
    fullName: "Alex Morgan",
    headline: "Senior Full-Stack Engineer & System Architect",
    bio: "Passionate software engineer with 6+ years of experience building scalable web applications, distributed backend services, and interactive user interfaces.",
    profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop",
    location: "San Francisco, CA",
    website: "alexmorgan.dev",
    github: "alexmorgan",
    linkedin: "alexmorgan-dev",
    twitter: "alexmorgan_tech",
    email: "alex@example.com",
    phone: "+1 (555) 019-2834",
    showEmail: true,
    showPhone: true,
  },
  projects: [
    {
      id: "p1",
      title: "CloudScale SaaS Platform",
      description: "Enterprise analytics dashboard with real-time streaming pipelines, dynamic query generation, and role-based access control.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop",
      liveUrl: "https://example.com",
      githubUrl: "https://github.com",
      technologies: ["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL", "Prisma"],
      featured: true,
    },
    {
      id: "p2",
      title: "DevPulse Code Reviewer",
      description: "AI-assisted automated pull request reviewer integrating directly into GitHub Webhooks for continuous compliance.",
      image: null,
      liveUrl: "https://example.com",
      githubUrl: "https://github.com",
      technologies: ["Node.js", "GraphQL", "Docker", "Redis"],
      featured: false,
    },
  ],
  skills: [
    { id: "s1", name: "TypeScript", category: "Languages", proficiency: 95 },
    { id: "s2", name: "React / Next.js", category: "Frontend", proficiency: 92 },
    { id: "s3", name: "Node.js", category: "Backend", proficiency: 88 },
    { id: "s4", name: "PostgreSQL & Prisma", category: "Databases", proficiency: 85 },
  ],
  experience: [
    {
      id: "e1",
      company: "Apex Tech Labs",
      position: "Lead Full-Stack Engineer",
      employmentType: "FULL_TIME",
      location: "San Francisco, CA",
      startDate: "2023-01-15",
      endDate: null,
      current: true,
      description: "Architected modern microservice infrastructure, reducing p99 latency by 35%. Mentored junior developers and led frontend platform refactoring.",
    },
    {
      id: "e2",
      company: "Innovate Digital",
      position: "Senior Software Engineer",
      employmentType: "FULL_TIME",
      location: "San Jose, CA",
      startDate: "2021-03-01",
      endDate: "2022-12-31",
      current: false,
      description: "Built high-throughput data processing pipelines and real-time dashboard visualization tools.",
    },
  ],
  education: [
    {
      id: "ed1",
      institution: "University of California, Berkeley",
      degree: "BTECH",
      fieldOfStudy: "COMPUTER_SCIENCE",
      customDegree: null,
      customFieldOfStudy: null,
      location: "Berkeley, CA",
      startDate: "2017-08-25",
      endDate: "2021-05-15",
      current: false,
      grade: "3.9 GPA",
      description: "Dean's Honor List, Specialization in Distributed Systems & Machine Learning.",
    },
  ],
};

export default function TemplateSelectionClient({
  initialTemplate,
}: TemplateSelectionClientProps) {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateValue>(initialTemplate);
  const [activePreview, setActivePreview] = useState<TemplateValue | null>(null);
  const [isUpdating, setIsUpdating] = useState<TemplateValue | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSelectTemplate = async (template: TemplateValue) => {
    if (template === selectedTemplate) return;

    setIsUpdating(template);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/portfolio/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update template.");
      }

      setSelectedTemplate(template);
      setSuccessMessage(`Successfully switched template to "${template}".`);
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("An error occurred while saving template.");
      }
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            <LayoutTemplate className="w-4 h-4" />
            <span>Presentation Settings</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Portfolio Templates
          </h1>
          <p className="text-sm text-slate-400">
            Choose how your public portfolio looks. Changing templates only alters presentation — your profile, projects, skills, experience, and education data remain intact.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PORTFOLIO_TEMPLATES.map((tmpl) => {
          const isSelected = selectedTemplate === tmpl.value;
          const isPending = isUpdating === tmpl.value;

          return (
            <div
              key={tmpl.value}
              className={`glass-card rounded-2xl border transition-all p-6 flex flex-col justify-between space-y-6 shadow-xl relative group ${
                isSelected
                  ? "border-indigo-500/80 bg-indigo-950/20 ring-1 ring-indigo-500/30"
                  : "border-slate-800 hover:border-slate-700/80"
              }`}
            >
              <div className="space-y-4">
                {/* Header & Badges */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                      <span>{tmpl.name}</span>
                    </h2>
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-semibold">
                      {tmpl.badge}
                    </span>
                  </div>

                  {isSelected && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shrink-0">
                      <Check className="w-3.5 h-3.5" />
                      <span>Active</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {tmpl.description}
                </p>

                {/* Features List */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Highlights:
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {tmpl.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-indigo-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActivePreview(tmpl.value)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white font-semibold text-xs transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span>Preview</span>
                </button>

                <button
                  type="button"
                  disabled={isSelected || isPending}
                  onClick={() => handleSelectTemplate(tmpl.value)}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 cursor-default"
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md shadow-indigo-500/20 active:scale-[0.98]"
                  }`}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : isSelected ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Selected</span>
                    </>
                  ) : (
                    <span>Use Template</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* FULLSCREEN LIVE TEMPLATE PREVIEW MODAL */}
      {activePreview && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col animate-fade-in">
          {/* Modal Top Bar */}
          <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-white">
                Live Preview: {PORTFOLIO_TEMPLATES.find((t) => t.value === activePreview)?.name} Template
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">
                (Rendered using sample portfolio data)
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  handleSelectTemplate(activePreview);
                  setActivePreview(null);
                }}
                disabled={selectedTemplate === activePreview}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-50"
              >
                {selectedTemplate === activePreview ? "Currently Active" : "Apply This Template"}
              </button>

              <button
                type="button"
                onClick={() => setActivePreview(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                title="Close Preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Preview Body */}
          <div className="flex-1 overflow-y-auto">
            <PortfolioRenderer
              portfolioData={MOCK_PORTFOLIO_DATA}
              template={activePreview}
            />
          </div>
        </div>
      )}
    </div>
  );
}
