"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Building2,
  MapPin,
  Calendar,
  FileText,
  Loader2,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import {
  EMPLOYMENT_TYPES,
  EMPLOYMENT_TYPE_LABELS,
  EmploymentTypeEnum,
} from "@/lib/validations/experience";

export interface ExperienceFormData {
  position: string;
  company: string;
  employmentType: EmploymentTypeEnum;
  location?: string;
  startDate: string; // ISO date string (YYYY-MM-DD)
  endDate?: string; // ISO date string or empty
  current: boolean;
  description?: string;
}

interface ExperienceFormProps {
  initialData?: ExperienceFormData;
  onSubmit: (data: ExperienceFormData) => Promise<void>;
  isSaving: boolean;
  pageTitle: string;
  submitButtonText: string;
}

export default function ExperienceForm({
  initialData,
  onSubmit,
  isSaving,
  pageTitle,
  submitButtonText,
}: ExperienceFormProps) {
  const [formData, setFormData] = useState<ExperienceFormData>({
    position: initialData?.position || "",
    company: initialData?.company || "",
    employmentType: initialData?.employmentType || "FULL_TIME",
    location: initialData?.location || "",
    startDate: initialData?.startDate || "",
    endDate: initialData?.endDate || "",
    current: initialData?.current ?? false,
    description: initialData?.description || "",
  });

  const [formError, setFormError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
        ...(name === "current" && checked ? { endDate: "" } : {}),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setFormError("");
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formData.position.trim()) {
      setFormError("Job title / position is required.");
      return;
    }

    if (!formData.company.trim()) {
      setFormError("Company name is required.");
      return;
    }

    if (!formData.startDate) {
      setFormError("Start date is required.");
      return;
    }

    if (!formData.current && !formData.endDate) {
      setFormError("End date is required unless this is your current job.");
      return;
    }

    if (!formData.current && formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        setFormError("End date cannot be before start date.");
        return;
      }
    }

    try {
      await onSubmit({
        ...formData,
        endDate: formData.current ? "" : formData.endDate,
      });
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
            href="/dashboard/experience"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Experience</span>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {pageTitle}
          </h1>
          <p className="text-sm text-slate-400">
            Build your professional career timeline for your portfolio.
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
            Position & Company Info
          </h2>

          {/* Job Title / Position */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Job Title <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Briefcase className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="position"
                required
                value={formData.position}
                onChange={handleChange}
                placeholder="e.g., Junior Software Engineer, Lead Designer"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-colors"
              />
            </div>
          </div>

          {/* Company */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Company <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Building2 className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="company"
                required
                value={formData.company}
                onChange={handleChange}
                placeholder="e.g., ABC Technologies, Google"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-colors"
              />
            </div>
          </div>

          {/* Grid: Employment Type & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Employment Type */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Employment Type <span className="text-rose-400">*</span>
              </label>
              <select
                name="employmentType"
                required
                value={formData.employmentType}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-colors cursor-pointer"
              >
                {EMPLOYMENT_TYPES.map((type) => (
                  <option key={type} value={type} className="bg-slate-900 text-white">
                    {EMPLOYMENT_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Location <span className="text-slate-500">(Optional)</span>
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
                  placeholder="e.g., Indore, India or Remote"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Dates & Current Job Section */}
          <div className="space-y-4 pt-3 border-t border-slate-800/80">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Dates & Employment Status
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Start Date */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Start Date <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    type="date"
                    name="startDate"
                    required
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-colors"
                  />
                </div>
              </div>

              {/* End Date */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  End Date {!formData.current && <span className="text-rose-400">*</span>}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    type="date"
                    name="endDate"
                    disabled={formData.current}
                    value={formData.current ? "" : formData.endDate}
                    onChange={handleChange}
                    placeholder={formData.current ? "Present" : ""}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Current Job Toggle */}
            <div className="flex items-center gap-2.5 pt-1">
              <input
                type="checkbox"
                id="current-job-checkbox"
                name="current"
                checked={formData.current}
                onChange={handleChange}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-950 cursor-pointer"
              />
              <label
                htmlFor="current-job-checkbox"
                className="text-xs font-semibold text-slate-200 cursor-pointer select-none"
              >
                I currently work here
              </label>
            </div>
          </div>

          {/* Description */}
          <div className="pt-3 border-t border-slate-800/80">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Description <span className="text-slate-500">(Optional)</span>
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3.5 text-slate-500">
                <FileText className="w-4 h-4" />
              </div>
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your key responsibilities, achievements, and impact..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-colors leading-relaxed resize-y"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-800">
          <Link
            href="/dashboard/experience"
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
