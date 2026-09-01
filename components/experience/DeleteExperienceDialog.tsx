"use client";

import { AlertTriangle, Loader2 } from "lucide-react";

interface DeleteExperienceDialogProps {
  isOpen: boolean;
  position: string;
  company: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteExperienceDialog({
  isOpen,
  position,
  company,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteExperienceDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md glass-card p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-6 transform transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-exp-dialog-title"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3
              id="delete-exp-dialog-title"
              className="text-lg font-bold text-white tracking-tight"
            >
              Delete Experience?
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Are you sure you want to delete:
            </p>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 space-y-0.5">
              <p className="font-semibold text-white text-sm">{position}</p>
              <p className="text-slate-400 font-medium">{company}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800/80">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/20 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
