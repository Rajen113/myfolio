import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import EducationList from "@/components/education/EducationList";
import { PlusCircle, ArrowLeft } from "lucide-react";

export default async function EducationDashboardPage() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Fetch authenticated user's education records from PostgreSQL
  const rawEducation = await prisma.education.findMany({
    where: { userId },
    orderBy: [
      { current: "desc" },
      { displayOrder: "asc" },
      { startDate: "desc" },
      { createdAt: "desc" },
    ],
  });

  const educationList = rawEducation.map((e) => ({
    id: e.id,
    institution: e.institution,
    degree: e.degree,
    fieldOfStudy: e.fieldOfStudy,
    location: e.location,
    startDate: e.startDate.toISOString().split("T")[0],
    endDate: e.endDate ? e.endDate.toISOString().split("T")[0] : null,
    current: e.current,
    grade: e.grade,
    description: e.description,
    displayOrder: e.displayOrder,
  }));

  return (
    <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Education
            </h1>
          </div>
          <p className="text-sm text-slate-400">
            Showcase your academic background.
          </p>
        </div>

        <div>
          <Link
            href="/dashboard/education/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 transition-all active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Education</span>
          </Link>
        </div>
      </div>

      {/* Education List */}
      <EducationList initialEducation={educationList} />
    </div>
  );
}
