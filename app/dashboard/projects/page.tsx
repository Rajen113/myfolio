import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProjectList from "@/components/projects/ProjectList";
import { PlusCircle, ArrowLeft } from "lucide-react";

export default async function ProjectsDashboardPage() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Fetch authenticated user's projects from database
  const rawProjects = await prisma.project.findMany({
    where: { userId },
    orderBy: [
      { featured: "desc" },
      { displayOrder: "asc" },
      { createdAt: "desc" },
    ],
  });

  const projects = rawProjects.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    image: p.image,
    liveUrl: p.liveUrl,
    githubUrl: p.githubUrl,
    technologies: p.technologies,
    featured: p.featured,
    displayOrder: p.displayOrder,
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
              Projects
            </h1>
          </div>
          <p className="text-sm text-slate-400">
            Showcase your best work, side projects, and open source contributions.
          </p>
        </div>

        <div>
          <Link
            href="/dashboard/projects/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 transition-all active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Project</span>
          </Link>
        </div>
      </div>

      {/* Projects List */}
      <ProjectList initialProjects={projects} />
    </div>
  );
}
