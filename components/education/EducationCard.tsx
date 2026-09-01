"use client";

import Link from "next/link";
import {
  Edit,
  Trash2,
  ChevronUp,
  ChevronDown,
  GraduationCap,
  Building2,
  MapPin,
  Calendar,
  Award,
} from "lucide-react";
import { formatEducationDate } from "@/lib/validations/education";
import {
  getDegreeLabel,
  getFieldOfStudyLabel,
} from "@/lib/constants/education-options";

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string | null;
  customDegree?: string | null;
  customFieldOfStudy?: string | null;
  location?: string | null;
  startDate: string;
  endDate?: string | null;
  current: boolean;
  grade?: string | null;
  description?: string | null;
  displayOrder: number;
}

interface EducationCardProps {
  education: EducationItem;
  onDeleteClick: (education: EducationItem) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  isReordering?: boolean;
}

export default function EducationCard({
  education,
  onDeleteClick,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  isReordering,
}: EducationCardProps) {
  const startFormatted = formatEducationDate(education.startDate);
  const endFormatted = education.current
    ? "Present"
    : formatEducationDate(education.endDate);

  const dateRangeDisplay = `${startFormatted} — ${endFormatted}`;
  const degreeLabel = getDegreeLabel(education.degree, education.customDegree);
  const fieldLabel = getFieldOfStudyLabel(education.fieldOfStudy, education.customFieldOfStudy);

  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 hover:border-slate-700/80 transition-all shadow-xl flex flex-col justify-between">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-400 shrink-0" />
              <span>{degreeLabel}</span>
            </h3>
            {fieldLabel && (
              <p className="text-xs font-semibold text-purple-300">
                {fieldLabel}
              </p>
            )}
            <p className="text-sm font-semibold text-slate-300 flex items-center gap-1.5 pt-0.5">
              <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{education.institution}</span>
            </p>
          </div>

          {/* Reorder controls */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              disabled={!canMoveUp || isReordering}
              onClick={onMoveUp}
              title="Move Up"
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={!canMoveDown || isReordering}
              onClick={onMoveDown}
              title="Move Down"
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-details: Date range, location, grade */}
        <div className="space-y-2 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-slate-400 flex items-center gap-1 font-mono font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>{dateRangeDisplay}</span>
            </span>

            {education.current && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
                Currently Studying
              </span>
            )}

            {education.location && (
              <span className="text-slate-400 flex items-center gap-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>{education.location}</span>
              </span>
            )}
          </div>

          {education.grade && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-semibold text-xs">
              <Award className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>Grade: {education.grade}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {education.description && (
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-2 border-t border-slate-800/60 whitespace-pre-line">
            {education.description}
          </p>
        )}
      </div>

      {/* Footer with Edit / Delete */}
      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-end gap-2 text-xs">
        <Link
          href={`/dashboard/education/${education.id}/edit`}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white font-medium transition-colors"
        >
          <Edit className="w-3.5 h-3.5" />
          <span>Edit</span>
        </Link>

        <button
          type="button"
          onClick={() => onDeleteClick(education)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 hover:text-rose-200 font-medium transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
}
