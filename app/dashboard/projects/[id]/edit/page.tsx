"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import ProjectForm, { ProjectFormData } from "@/components/projects/ProjectForm";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const { status: authStatus } = useSession();

  const projectId = params?.id as string;

  const [initialData, setInitialData] = useState<ProjectFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchProject() {
      try {
        const res = await fetch(`/api/projects/${projectId}`);
        const data = await res.json();

        if (res.status === 404 || !res.ok || !data.project) {
          setNotFoundError(true);
          return;
        }

        const p = data.project;
        setInitialData({
          title: p.title,
          description: p.description,
          image: p.image || "",
          liveUrl: p.liveUrl || "",
          githubUrl: p.githubUrl || "",
          technologies: p.technologies || [],
          featured: p.featured ?? false,
        });
      } catch (err) {
        console.error("Failed to load project details:", err);
        setNotFoundError(true);
      } finally {
        setLoading(false);
      }
    }

    if (authStatus === "authenticated" && projectId) {
      fetchProject();
    } else if (authStatus === "unauthenticated") {
      router.push("/login");
    }
  }, [authStatus, projectId, router]);

  if (authStatus === "loading" || loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
          <span>Loading project details...</span>
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
        <h2 className="text-2xl font-bold text-white">Project not found</h2>
        <p className="text-sm text-slate-400 max-w-sm">
          The project you are looking for does not exist or you do not have permission to edit it.
        </p>
        <Link
          href="/dashboard/projects"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm font-medium text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </Link>
      </div>
    );
  }

  const handleSubmit = async (data: ProjectFormData) => {
    setIsSaving(true);

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.error || "Failed to update project");
      }

      router.push("/dashboard/projects");
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProjectForm
      initialData={initialData}
      onSubmit={handleSubmit}
      isSaving={isSaving}
      pageTitle="Edit Project"
      submitButtonText="Update Project"
    />
  );
}
