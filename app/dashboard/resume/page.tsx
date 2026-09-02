import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getResumeData } from "@/lib/resume/get-resume-data";
import ResumeClient from "./ResumeClient";

export const metadata = {
  title: "Resume Builder — MyFolio Dashboard",
  description: "Generate and download a professional PDF resume using your MyFolio profile.",
};

export default async function ResumePage() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  const resumeData = await getResumeData(session.user.id);

  if (!resumeData) {
    redirect("/dashboard/profile");
  }

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ResumeClient initialData={resumeData} />
    </div>
  );
}
