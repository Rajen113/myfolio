"use client";

import Link from "next/link";
import {
  Star,
  Globe,
  Edit,
  Trash2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { GithubIcon } from "@/components/SocialIcons";

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  image?: string | null;
  liveUrl?: string | null;
  githubUrl?: string | null;
  technologies: string[];
  featured: boolean;
  displayOrder: number;
}

interface ProjectCardProps {
  project: ProjectItem;
  onDeleteClick: (project: ProjectItem) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  isReordering?: boolean;
}

export default function ProjectCard({
  project,
  onDeleteClick,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  isReordering,
}: ProjectCardProps) {
  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 hover:border-slate-700/80 transition-all shadow-xl flex flex-col justify-between relative group">
      <div className="space-y-3">
        {/* Header with Title & Reorder / Featured */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-tight">
                {project.title}
              </h3>
              {project.featured && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span>Featured</span>
                </span>
              )}
            </div>
          </div>

          {/* Move Up / Move Down buttons */}
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

        {/* Description */}
        <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed">
          {project.description}
        </p>

        {/* Technologies list */}
        {project.technologies && project.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {project.technologies.map((tech, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 text-xs font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer with links and Edit / Delete actions */}
      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3 text-xs">
        {/* Project External Links */}
        <div className="flex items-center gap-3">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Live Demo</span>
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-slate-300 hover:text-white font-medium"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
          )}
        </div>

        {/* Edit / Delete Buttons */}
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/projects/${project.id}/edit`}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white font-medium transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit</span>
          </Link>

          <button
            type="button"
            onClick={() => onDeleteClick(project)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 hover:text-rose-200 font-medium transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
