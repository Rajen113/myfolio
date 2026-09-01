"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Wrench,
  Layers,
  Award,
  Loader2,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import {
  SKILL_PROFICIENCY_VALUES,
  SKILL_CATEGORIES,
  SkillProficiencyType,
} from "@/lib/validations/skill";

export interface SkillFormData {
  name: string;
  category?: string;
  proficiency: SkillProficiencyType;
}

const PROFICIENCY_LABELS: Record<SkillProficiencyType, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  EXPERT: "Expert",
};

interface SkillFormProps {
  initialData?: SkillFormData;
  onSubmit: (data: SkillFormData) => Promise<void>;
  isSaving: boolean;
  pageTitle: string;
  submitButtonText: string;
}

export default function SkillForm({
  initialData,
  onSubmit,
  isSaving,
  pageTitle,
  submitButtonText,
}: SkillFormProps) {
  const [formData, setFormData] = useState<SkillFormData>({
    name: initialData?.name || "",
    category: initialData?.category || "",
    proficiency: initialData?.proficiency || "INTERMEDIATE",
  });

  const [formError, setFormError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError("");
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name.trim()) {
      setFormError("Skill name is required.");
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
    <div className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <Link
            href="/dashboard/skills"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Skills</span>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {pageTitle}
          </h1>
          <p className="text-sm text-slate-400">
            Showcase your technical capabilities and mastery on your public portfolio.
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
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-5">
          <h2 className="text-base font-semibold text-white border-b border-slate-800/80 pb-3">
            Skill Details
          </h2>

          {/* Skill Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Skill Name <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Wrench className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., React, PostgreSQL, Python"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-colors"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Category <span className="text-slate-500">(Optional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Layers className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="category"
                list="category-suggestions"
                value={formData.category}
                onChange={handleChange}
                placeholder="Select or type a category (e.g., Frontend, Database)"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-colors"
              />
              <datalist id="category-suggestions">
                {SKILL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Proficiency */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Proficiency Level <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Award className="w-4 h-4" />
              </div>
              <select
                name="proficiency"
                required
                value={formData.proficiency}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-colors cursor-pointer"
              >
                {SKILL_PROFICIENCY_VALUES.map((level) => (
                  <option key={level} value={level} className="bg-slate-900 text-white">
                    {PROFICIENCY_LABELS[level]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-800">
          <Link
            href="/dashboard/skills"
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
