"use client";

import { useState } from "react";
import Link from "next/link";
import { PlusCircle, Loader2, GraduationCap, AlertCircle, CheckCircle2 } from "lucide-react";
import EducationCard, { EducationItem } from "./EducationCard";
import DeleteEducationDialog from "./DeleteEducationDialog";

interface EducationListProps {
  initialEducation: EducationItem[];
}

export default function EducationList({ initialEducation }: EducationListProps) {
  const [educationList, setEducationList] = useState<EducationItem[]>(initialEducation);
  const [deletingEducation, setDeletingEducation] = useState<EducationItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleMove = async (index: number, direction: "up" | "down") => {
    const newEducationList = [...educationList];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newEducationList.length) return;

    // Swap items
    const temp = newEducationList[index];
    newEducationList[index] = newEducationList[targetIndex];
    newEducationList[targetIndex] = temp;

    setEducationList(newEducationList);
    setIsReordering(true);
    setMessage(null);

    try {
      const educationIds = newEducationList.map((e) => e.id);
      const res = await fetch("/api/education/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ educationIds }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to reorder education records");
      }
    } catch (err: unknown) {
      console.error("Reorder failed:", err);
      // Revert on error
      setEducationList(educationList);
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to save education order",
      });
    } finally {
      setIsReordering(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingEducation) return;

    setIsDeleting(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/education/${deletingEducation.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete education record");
      }

      setEducationList((prev) => prev.filter((e) => e.id !== deletingEducation.id));
      setMessage({
        type: "success",
        text: "✓ Education deleted successfully",
      });
    } catch (err: unknown) {
      console.error("Delete failed:", err);
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to delete education record",
      });
    } finally {
      setIsDeleting(false);
      setDeletingEducation(null);
    }
  };

  if (educationList.length === 0) {
    return (
      <div className="p-12 rounded-3xl glass-card border border-slate-800 text-center space-y-6 max-w-xl mx-auto my-8 shadow-2xl">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
          <GraduationCap className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            No education added yet
          </h2>
          <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
            Add your academic background to complete your portfolio.
          </p>
        </div>

        <div>
          <Link
            href="/dashboard/education/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 active:scale-[0.98] transition-all"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Add Education</span>
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
          <span>Updating education sequence...</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {educationList.map((education, index) => (
          <EducationCard
            key={education.id}
            education={education}
            onDeleteClick={(edu) => setDeletingEducation(edu)}
            onMoveUp={() => handleMove(index, "up")}
            onMoveDown={() => handleMove(index, "down")}
            canMoveUp={index > 0}
            canMoveDown={index < educationList.length - 1}
            isReordering={isReordering}
          />
        ))}
      </div>

      {deletingEducation && (
        <DeleteEducationDialog
          isOpen={Boolean(deletingEducation)}
          degree={deletingEducation.degree}
          institution={deletingEducation.institution}
          isDeleting={isDeleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingEducation(null)}
        />
      )}
    </div>
  );
}
