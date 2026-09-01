"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import EducationForm, { EducationFormData } from "@/components/education/EducationForm";
import { Loader2 } from "lucide-react";

export default function NewEducationPage() {
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

  const handleSubmit = async (data: EducationFormData) => {
    setIsSaving(true);

    try {
      const res = await fetch("/api/education", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.error || "Failed to create education record");
      }

      router.push("/dashboard/education");
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <EducationForm
      onSubmit={handleSubmit}
      isSaving={isSaving}
      pageTitle="Add Education"
      submitButtonText="Save Education"
    />
  );
}
