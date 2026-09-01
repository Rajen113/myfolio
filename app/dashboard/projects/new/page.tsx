"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ProjectForm, { ProjectFormData } from "@/components/projects/ProjectForm";
import { Loader2 } from "lucide-react";

export default function NewProjectPage() {
  const router = useRouter();
  const { status: authStatus } = useSession();
  const [isSaving, setIsSaving] = useState(false);

  if (authStatus === "loading") {
    return (
      <div className="flex-1 flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
          <span>Loading session...</span>
        </div>
      </div>
    );
  }

  if (authStatus === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const handleSubmit = async (data: ProjectFormData) => {
    setIsSaving(true);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.error || "Failed to create project");
      }

      router.push("/dashboard/projects");
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProjectForm
      onSubmit={handleSubmit}
      isSaving={isSaving}
      pageTitle="Add Project"
      submitButtonText="Save Project"
    />
  );
}
