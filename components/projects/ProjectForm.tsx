"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FolderGit2,
  Globe,
  Star,
  Upload,
  Plus,
  X,
  Loader2,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { GithubIcon } from "@/components/SocialIcons";

export interface ProjectFormData {
  title: string;
  description: string;
  image?: string;
  liveUrl?: string;
  githubUrl?: string;
  technologies: string[];
  featured: boolean;
}

interface ProjectFormProps {
  initialData?: ProjectFormData;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  isSaving: boolean;
  pageTitle: string;
  submitButtonText: string;
}

export default function ProjectForm({
  initialData,
  onSubmit,
  isSaving,
  pageTitle,
  submitButtonText,
}: ProjectFormProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    image: initialData?.image || "",
    liveUrl: initialData?.liveUrl || "",
    githubUrl: initialData?.githubUrl || "",
    technologies: initialData?.technologies || [],
    featured: initialData?.featured ?? false,
  });

  const [techInput, setTechInput] = useState("");
  const [techError, setTechError] = useState("");
  const [formError, setFormError] = useState("");

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
    setFormError("");
  };

  const handleAddTechnology = () => {
    const trimmed = techInput.trim();
    setTechError("");

    if (!trimmed) {
      return;
    }

    if (trimmed.length > 30) {
      setTechError("Technology name must not exceed 30 characters.");
      return;
    }

    if (formData.technologies.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      setTechError("This technology is already added.");
      return;
    }

    if (formData.technologies.length >= 15) {
      setTechError("Maximum 15 technologies allowed per project.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      technologies: [...prev.technologies, trimmed],
    }));
    setTechInput("");
  };

  const handleTechKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTechnology();
    }
  };

  const handleRemoveTechnology = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      technologies: prev.technologies.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formData.title.trim()) {
      setFormError("Project title is required.");
      return;
    }

    if (!formData.description.trim()) {
      setFormError("Description is required.");
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError("An unexpected error occurred.");
      }
    }
  };

  return (
    <div className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <Link
            href="/dashboard/projects"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Projects</span>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {pageTitle}
          </h1>
          <p className="text-sm text-slate-400">
            Showcase your work and technical achievements on your public portfolio.
          </p>
        </div>
      </div>

      {formError && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmitForm} className="space-y-6">
        {/* Basic Info */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-5">
          <h2 className="text-base font-semibold text-white border-b border-slate-800/80 pb-3">
            Project Details
          </h2>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Project Title <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <FolderGit2 className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., My Portfolio SaaS"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Description <span className="text-rose-400">*</span>
            </label>
            <textarea
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your project, key features, and technical architecture..."
              className="w-full px-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-colors resize-y"
            />
          </div>
        </div>

        {/* Project Image Placeholder */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-base font-semibold text-white">Project Image</h2>
          <div className="space-y-2">
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 text-slate-500 border border-slate-700/50 text-sm font-medium cursor-not-allowed opacity-75"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Image</span>
            </button>
            <p className="text-xs text-slate-500">
              Image upload will be available soon.
            </p>
          </div>
        </div>

        {/* Links */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-5">
          <h2 className="text-base font-semibold text-white border-b border-slate-800/80 pb-3">
            Project Links
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Live Demo URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Globe className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  name="liveUrl"
                  value={formData.liveUrl}
                  onChange={handleChange}
                  placeholder="https://myproject.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                GitHub Repository URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <GithubIcon className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  name="githubUrl"
                  value={formData.githubUrl}
                  onChange={handleChange}
                  placeholder="https://github.com/username/repo"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Technologies UI */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h2 className="text-base font-semibold text-white">Technologies</h2>
            <span className="text-xs text-slate-400">
              {formData.technologies.length}/15 added
            </span>
          </div>

          {/* Add input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={techInput}
              onChange={(e) => {
                setTechInput(e.target.value);
                setTechError("");
              }}
              onKeyDown={handleTechKeyDown}
              placeholder="e.g., Next.js, React, PostgreSQL"
              className="flex-1 px-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-colors"
            />
            <button
              type="button"
              onClick={handleAddTechnology}
              className="px-4 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-medium text-sm transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>

          {techError && (
            <p className="text-xs text-rose-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{techError}</span>
            </p>
          )}

          {/* Tech Badges */}
          {formData.technologies.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-2">
              {formData.technologies.map((tech, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800/90 border border-slate-700/80 text-xs font-medium text-indigo-300"
                >
                  <span>{tech}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTechnology(idx)}
                    className="hover:text-rose-400 text-slate-400 transition-colors"
                    title={`Remove ${tech}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic pt-1">
              No technologies added yet. Type a technology and click Add.
            </p>
          )}
        </div>

        {/* Featured Toggle */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div className="space-y-0.5">
            <label htmlFor="featured" className="text-sm font-semibold text-white flex items-center gap-2 cursor-pointer">
              <Star className={`w-4 h-4 ${formData.featured ? "fill-amber-400 text-amber-400" : "text-slate-400"}`} />
              <span>Featured Project</span>
            </label>
            <p className="text-xs text-slate-400">
              Featured projects are prioritized and highlighted on your public portfolio.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              id="featured"
              name="featured"
              checked={formData.featured}
              onChange={handleChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" />
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-800">
          <Link
            href="/dashboard/projects"
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>{submitButtonText}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
