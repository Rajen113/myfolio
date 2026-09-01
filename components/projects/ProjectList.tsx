"use client";

import { useState } from "react";
import Link from "next/link";
import { PlusCircle, Loader2, FolderPlus, AlertCircle, CheckCircle2 } from "lucide-react";
import ProjectCard, { ProjectItem } from "./ProjectCard";
import DeleteProjectDialog from "./DeleteProjectDialog";

interface ProjectListProps {
  initialProjects: ProjectItem[];
}

export default function ProjectList({ initialProjects }: ProjectListProps) {
  const [projects, setProjects] = useState<ProjectItem[]>(initialProjects);
  const [deletingProject, setDeletingProject] = useState<ProjectItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleMove = async (index: number, direction: "up" | "down") => {
    const newProjects = [...projects];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newProjects.length) return;

    // Swap items
    const temp = newProjects[index];
    newProjects[index] = newProjects[targetIndex];
    newProjects[targetIndex] = temp;

    setProjects(newProjects);
    setIsReordering(true);
    setMessage(null);

    try {
      const projectIds = newProjects.map((p) => p.id);
      const res = await fetch("/api/projects/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectIds }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to reorder projects");
      }
    } catch (err: unknown) {
      console.error("Reorder failed:", err);
      // Revert on error
      setProjects(projects);
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to save project order",
      });
    } finally {
      setIsReordering(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProject) return;

    setIsDeleting(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/projects/${deletingProject.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete project");
      }

      setProjects((prev) => prev.filter((p) => p.id !== deletingProject.id));
      setMessage({
        type: "success",
        text: "✓ Project deleted successfully",
      });
    } catch (err: unknown) {
      console.error("Delete failed:", err);
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to delete project",
      });
    } finally {
      setIsDeleting(false);
      setDeletingProject(null);
    }
  };

  if (projects.length === 0) {
    return (
      <div className="p-12 rounded-3xl glass-card border border-slate-800 text-center space-y-6 max-w-xl mx-auto my-8 shadow-2xl">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
          <FolderPlus className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            No projects yet
          </h2>
          <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
            Add your first project to showcase your technical skills and past work to potential clients and recruiters.
          </p>
        </div>

        <div>
          <Link
            href="/dashboard/projects/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 active:scale-[0.98] transition-all"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Add Project</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`flex items-center gap-2 p-4 rounded-xl text-sm border ${
            message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {isReordering && (
        <div className="flex items-center gap-2 text-xs text-indigo-400 font-medium animate-pulse">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Updating project sequence...</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project, index) => (
          <ProjectCard
            key={project.id}
            project={project}
            onDeleteClick={(p) => setDeletingProject(p)}
            onMoveUp={() => handleMove(index, "up")}
            onMoveDown={() => handleMove(index, "down")}
            canMoveUp={index > 0}
            canMoveDown={index < projects.length - 1}
            isReordering={isReordering}
          />
        ))}
      </div>

      {deletingProject && (
        <DeleteProjectDialog
          isOpen={Boolean(deletingProject)}
          projectTitle={deletingProject.title}
          isDeleting={isDeleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingProject(null)}
        />
      )}
    </div>
  );
}
