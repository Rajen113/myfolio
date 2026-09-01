import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DomainsClient, { CustomDomainItem } from "./DomainsClient";
import Link from "next/link";
import { ArrowLeft, Globe } from "lucide-react";

export const metadata = {
  title: "Custom Domains — MyFolio Dashboard",
  description: "Connect and manage custom domains for your public portfolio.",
};

export default async function DomainsPage() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true },
  });

  const rawDomains = await prisma.customDomain.findMany({
    where: { userId },
    orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }],
  });

  const customDomains: CustomDomainItem[] = rawDomains.map((d) => ({
    id: d.id,
    domain: d.domain,
    status: d.status,
    verificationToken: d.verificationToken,
    isPrimary: d.isPrimary,
    verifiedAt: d.verifiedAt ? d.verifiedAt.toISOString() : null,
    createdAt: d.createdAt.toISOString(),
  }));

  const cnameTarget = process.env.MYFOLIO_DOMAIN_TARGET || "cname.myfolio.com";

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Globe className="w-6 h-6 text-indigo-400" />
            <span>Custom Domains</span>
          </h1>
          <p className="text-xs text-slate-400">
            Connect your own custom domain (e.g. rajenmandal.com) to present a professional personal brand.
          </p>
        </div>
      </div>

      <DomainsClient
        initialDomains={customDomains}
        username={user?.username || ""}
        cnameTarget={cnameTarget}
      />
    </div>
  );
}
