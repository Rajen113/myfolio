import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TemplateSelectionClient from "./TemplateSelectionClient";
import { TemplateValue } from "@/lib/constants/portfolio-templates";

export const metadata = {
  title: "Portfolio Templates — MyFolio",
  description: "Select and customize your public portfolio website template.",
};

export default async function TemplatesPage() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  const settings = await prisma.portfolioSettings.findUnique({
    where: { userId },
  });

  const initialTemplate: TemplateValue = settings?.template || "MODERN";

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <TemplateSelectionClient initialTemplate={initialTemplate} />
    </div>
  );
}
