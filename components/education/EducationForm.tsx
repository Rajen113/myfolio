"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Building2,
  BookOpen,
  MapPin,
  Calendar,
  Award,
  FileText,
  Loader2,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import SearchableSelect from "./SearchableSelect";
import {
  DEGREE_OPTIONS,
  FIELD_OF_STUDY_OPTIONS,
} from "@/lib/constants/education-options";

export interface EducationFormData {
  institution: string;
  degree: string;
  customDegree?: string;
  fieldOfStudy?: string;
  customFieldOfStudy?: string;
  location?: string;
  startDate: string; // ISO date string (YYYY-MM-DD)
  endDate?: string;  // ISO date string or empty
  current: boolean;
  grade?: string;
  description?: string;
}

interface EducationFormProps {
  initialData?: EducationFormData;
  onSubmit: (data: EducationFormData) => Promise<void>;
  isSaving: boolean;
  pageTitle: string;
  submitButtonText: string;
}

export default function EducationForm({
  initialData,
  onSubmit,
  isSaving,
  pageTitle,
  submitButtonText,
}: EducationFormProps) {
  // Parse initial degree & field of study safely
  const parseInitialDegree = (rawDegree?: string, rawCustom?: string | null) => {
    if (!rawDegree) return { degree: "", customDegree: "" };
    if (rawDegree === "OTHER") {
      return { degree: "OTHER", customDegree: rawCustom || "" };
    }
    const exists = DEGREE_OPTIONS.some((opt) => opt.value === rawDegree);
    if (exists) {
      return { degree: rawDegree, customDegree: "" };
    }
    return { degree: "OTHER", customDegree: rawDegree };
  };

  const parseInitialFieldOfStudy = (rawField?: string, rawCustom?: string | null) => {
    if (!rawField) return { fieldOfStudy: "", customFieldOfStudy: "" };
    if (rawField === "OTHER") {
      return { fieldOfStudy: "OTHER", customFieldOfStudy: rawCustom || "" };
    }
    const exists = FIELD_OF_STUDY_OPTIONS.some((opt) => opt.value === rawField);
    if (exists) {
      return { fieldOfStudy: rawField, customFieldOfStudy: "" };
    }
    return { fieldOfStudy: "OTHER", customFieldOfStudy: rawField };
  };

  const parsedDegree = parseInitialDegree(initialData?.degree, initialData?.customDegree);
  const parsedField = parseInitialFieldOfStudy(initialData?.fieldOfStudy, initialData?.customFieldOfStudy);

  const [formData, setFormData] = useState<EducationFormData>({
    institution: initialData?.institution || "",
    degree: parsedDegree.degree,
    customDegree: parsedDegree.customDegree,
    fieldOfStudy: parsedField.fieldOfStudy,
    customFieldOfStudy: parsedField.customFieldOfStudy,
    location: initialData?.location || "",
    startDate: initialData?.startDate || "",
    endDate: initialData?.endDate || "",
    current: initialData?.current ?? false,
    grade: initialData?.grade || "",
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

  const handleSelectChange = (name: "degree" | "fieldOfStudy", value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "degree" && value !== "OTHER" ? { customDegree: "" } : {}),
      ...(name === "fieldOfStudy" && value !== "OTHER" ? { customFieldOfStudy: "" } : {}),
    }));
    setFormError("");
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formData.institution.trim()) {
      setFormError("Institution name is required.");
      return;
    }

    if (!formData.degree) {
      setFormError("Degree / Qualification is required.");
      return;
    }

    if (formData.degree === "OTHER" && (!formData.customDegree || !formData.customDegree.trim())) {
      setFormError("Please specify your degree / qualification when 'Other' is selected.");
      return;
    }

    if (formData.fieldOfStudy === "OTHER" && (!formData.customFieldOfStudy || !formData.customFieldOfStudy.trim())) {
      setFormError("Please specify your field of study when 'Other' is selected.");
      return;
    }

    if (!formData.startDate) {
      setFormError("Start date is required.");
      return;
    }

    if (!formData.current && !formData.endDate) {
      setFormError("End date is required unless this is your current education.");
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
        customDegree: formData.degree === "OTHER" ? formData.customDegree : undefined,
        customFieldOfStudy: formData.fieldOfStudy === "OTHER" ? formData.customFieldOfStudy : undefined,
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
            href="/dashboard/education"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Education</span>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {pageTitle}
          </h1>
          <p className="text-sm text-slate-400">
            Showcase your academic degrees, certifications, and achievements.
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
            Academic Information
          </h2>

          {/* Institution */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Institution <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Building2 className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="institution"
                required
                value={formData.institution}
                onChange={handleChange}
                placeholder="e.g., ABC Institute of Technology, Stanford University"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-colors"
              />
            </div>
          </div>

          {/* Grid: Degree & Field of Study */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Degree */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Degree / Qualification <span className="text-rose-400">*</span>
              </label>
              <SearchableSelect
                name="degree"
                options={DEGREE_OPTIONS}
                value={formData.degree}
                onChange={(val) => handleSelectChange("degree", val)}
                placeholder="Select Degree..."
                required
              />
            </div>

            {/* Field of Study */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Field of Study <span className="text-slate-500">(Optional)</span>
              </label>
              <SearchableSelect
                name="fieldOfStudy"
                options={FIELD_OF_STUDY_OPTIONS}
                value={formData.fieldOfStudy || ""}
                onChange={(val) => handleSelectChange("fieldOfStudy", val)}
                placeholder="Select Field of Study..."
              />
            </div>
          </div>

          {/* Conditional "Other" inputs */}
          {formData.degree === "OTHER" && (
            <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20 space-y-1.5 animate-fade-in">
              <label className="block text-xs font-semibold uppercase tracking-wider text-indigo-300">
                Specify Degree / Qualification <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <GraduationCap className="w-4 h-4 text-indigo-400" />
                </div>
                <input
                  type="text"
                  name="customDegree"
                  required
                  value={formData.customDegree || ""}
                  onChange={handleChange}
                  placeholder="e.g., Advanced Diploma in Robotics"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-indigo-500/30 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-colors"
                />
              </div>
            </div>
          )}

          {formData.fieldOfStudy === "OTHER" && (
            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/20 space-y-1.5 animate-fade-in">
              <label className="block text-xs font-semibold uppercase tracking-wider text-purple-300">
                Specify Field of Study <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <BookOpen className="w-4 h-4 text-purple-400" />
                </div>
                <input
                  type="text"
                  name="customFieldOfStudy"
                  required
                  value={formData.customFieldOfStudy || ""}
                  onChange={handleChange}
                  placeholder="e.g., Quantum Computing, Computational Neuroscience"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-purple-500/30 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm transition-colors"
                />
              </div>
            </div>
          )}

          {/* Location & Grade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  placeholder="e.g., Indore, India"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-colors"
                />
              </div>
            </div>

            {/* Grade / GPA */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Grade / GPA <span className="text-slate-500">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Award className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  placeholder="e.g., 76%, 3.8/4.0 GPA, First Class"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Dates & Status */}
          <div className="space-y-4 pt-3 border-t border-slate-800/80">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Duration & Status
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

            {/* Currently studying checkbox */}
            <div className="flex items-center gap-2.5 pt-1">
              <input
                type="checkbox"
                id="current-edu-checkbox"
                name="current"
                checked={formData.current}
                onChange={handleChange}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-950 cursor-pointer"
              />
              <label
                htmlFor="current-edu-checkbox"
                className="text-xs font-semibold text-slate-200 cursor-pointer select-none"
              >
                Currently studying here
              </label>
            </div>
          </div>

          {/* Description */}
          <div className="pt-3 border-t border-slate-800/80">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Description / Activities <span className="text-slate-500">(Optional)</span>
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
                placeholder="Relevant coursework, achievements, academic honors, activities, etc..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-colors leading-relaxed resize-y"
              />
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-800">
          <Link
            href="/dashboard/education"
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
