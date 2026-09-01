"use client";

import Link from "next/link";
import { Edit, Trash2, ChevronUp, ChevronDown, Tag } from "lucide-react";
import { SkillProficiencyType } from "@/lib/validations/skill";

export interface SkillItem {
  id: string;
  name: string;
  category?: string | null;
  proficiency: SkillProficiencyType;
  displayOrder: number;
}

const PROFICIENCY_CONFIG: Record<
  SkillProficiencyType,
  { label: string; percentage: number; color: string }
> = {
  BEGINNER: { label: "Beginner", percentage: 25, color: "from-blue-500 to-cyan-400" },
  INTERMEDIATE: { label: "Intermediate", percentage: 50, color: "from-indigo-500 to-purple-400" },
  ADVANCED: { label: "Advanced", percentage: 75, color: "from-purple-500 to-pink-400" },
  EXPERT: { label: "Expert", percentage: 95, color: "from-amber-400 to-emerald-400" },
};

interface SkillCardProps {
  skill: SkillItem;
  onDeleteClick: (skill: SkillItem) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  isReordering?: boolean;
}

export default function SkillCard({
  skill,
  onDeleteClick,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  isReordering,
}: SkillCardProps) {
  const prof = PROFICIENCY_CONFIG[skill.proficiency] || PROFICIENCY_CONFIG.INTERMEDIATE;

  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 hover:border-slate-700/80 transition-all shadow-xl flex flex-col justify-between">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white tracking-tight">
              {skill.name}
            </h3>
            {skill.category && (
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Tag className="w-3 h-3 text-indigo-400" />
                <span>{skill.category}</span>
              </p>
            )}
          </div>

          {/* Reorder buttons */}
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

        {/* Proficiency Visual Bar */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200">{prof.label}</span>
            <span className="text-slate-500 font-mono">{prof.percentage}%</span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
            <div
              className={`h-full bg-gradient-to-r ${prof.color} transition-all duration-500 rounded-full`}
              style={{ width: `${prof.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer with Edit / Delete */}
      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-end gap-2 text-xs">
        <Link
          href={`/dashboard/skills/${skill.id}/edit`}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white font-medium transition-colors"
        >
          <Edit className="w-3.5 h-3.5" />
          <span>Edit</span>
        </Link>

        <button
          type="button"
          onClick={() => onDeleteClick(skill)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 hover:text-rose-200 font-medium transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
}
