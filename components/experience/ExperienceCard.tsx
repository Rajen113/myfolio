"use client";

import Link from "next/link";
import {
  Edit,
  Trash2,
  ChevronUp,
  ChevronDown,
  Building2,
  MapPin,
  Calendar,
} from "lucide-react";
import {
  EMPLOYMENT_TYPE_LABELS,
  EmploymentTypeEnum,
  formatExperienceDate,
} from "@/lib/validations/experience";

export interface ExperienceItem {
  id: string;
  position: string;
  company: string;
  employmentType: EmploymentTypeEnum;
  location?: string | null;
  startDate: string;
  endDate?: string | null;
  current: boolean;
  description?: string | null;
  displayOrder: number;
}

interface ExperienceCardProps {
  experience: ExperienceItem;
  onDeleteClick: (experience: ExperienceItem) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  isReordering?: boolean;
}

export default function ExperienceCard({
  experience,
  onDeleteClick,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  isReordering,
}: ExperienceCardProps) {
  const empLabel =
    EMPLOYMENT_TYPE_LABELS[experience.employmentType] || experience.employmentType;

  const startFormatted = formatExperienceDate(experience.startDate);
  const endFormatted = experience.current
    ? "Present"
    : formatExperienceDate(experience.endDate);

  const dateRangeDisplay = `${startFormatted} — ${endFormatted}`;

  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 hover:border-slate-700/80 transition-all shadow-xl flex flex-col justify-between">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white tracking-tight">
              {experience.position}
            </h3>
            <p className="text-sm font-semibold text-indigo-300 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{experience.company}</span>
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

        {/* Sub-details: Employment type, location & date range */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-semibold">
              {empLabel}
            </span>

            {experience.current && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
                Current Role
              </span>
            )}

            {experience.location && (
              <span className="text-slate-400 flex items-center gap-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>{experience.location}</span>
              </span>
            )}
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-1.5 font-medium pt-0.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>{dateRangeDisplay}</span>
          </div>
        </div>

        {/* Description */}
        {experience.description && (
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-2 border-t border-slate-800/60 whitespace-pre-line">
            {experience.description}
          </p>
        )}
      </div>

      {/* Footer with Edit / Delete */}
      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-end gap-2 text-xs">
        <Link
          href={`/dashboard/experience/${experience.id}/edit`}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white font-medium transition-colors"
        >
          <Edit className="w-3.5 h-3.5" />
          <span>Edit</span>
        </Link>

        <button
          type="button"
          onClick={() => onDeleteClick(experience)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 hover:text-rose-200 font-medium transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
}
