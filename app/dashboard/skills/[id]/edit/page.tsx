"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import SkillForm, { SkillFormData } from "@/components/skills/SkillForm";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { SkillProficiencyType } from "@/lib/validations/skill";

export default function EditSkillPage() {
  const router = useRouter();
  const params = useParams();
  const { status: authStatus } = useSession();

  const skillId = params?.id as string;

  const [initialData, setInitialData] = useState<SkillFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchSkill() {
      try {
        const res = await fetch(`/api/skills/${skillId}`);
        const data = await res.json();

        if (res.status === 404 || !res.ok || !data.skill) {
          setNotFoundError(true);
          return;
        }

        const s = data.skill;
        setInitialData({
          name: s.name,
          category: s.category || "",
          proficiency: s.proficiency as SkillProficiencyType,
        });
      } catch (err) {
        console.error("Failed to load skill details:", err);
        setNotFoundError(true);
      } finally {
        setLoading(false);
      }
    }

    if (authStatus === "authenticated" && skillId) {
      fetchSkill();
    } else if (authStatus === "unauthenticated") {
      router.push("/login");
    }
  }, [authStatus, skillId, router]);

  if (authStatus === "loading" || loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
          <span>Loading skill details...</span>
        </div>
      </div>
    );
  }

  if (notFoundError || !initialData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-white">Skill not found</h2>
        <p className="text-sm text-slate-400 max-w-sm">
          The skill you are looking for does not exist or you do not have permission to edit it.
        </p>
        <Link
          href="/dashboard/skills"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm font-medium text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Skills</span>
        </Link>
      </div>
    );
  }

  const handleSubmit = async (data: SkillFormData) => {
    setIsSaving(true);

    try {
      const res = await fetch(`/api/skills/${skillId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.error || "Failed to update skill");
      }

      router.push("/dashboard/skills");
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SkillForm
      initialData={initialData}
      onSubmit={handleSubmit}
      isSaving={isSaving}
      pageTitle="Edit Skill"
      submitButtonText="Update Skill"
    />
  );
}
