import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyDomainDns } from "@/lib/services/dns-verification";
import { revalidatePortfolioCache } from "@/lib/portfolio/cache";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = session.user.id;

    // Find custom domain ensuring user ownership
    const customDomain = await prisma.customDomain.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!customDomain) {
      return NextResponse.json({ error: "Custom domain not found" }, { status: 404 });
    }

    // Perform server-side DNS TXT check
    const dnsResult = await verifyDomainDns(
      customDomain.domain,
      customDomain.verificationToken
    );

    if (dnsResult.success) {
      const updatedDomain = await prisma.customDomain.update({
        where: { id: customDomain.id },
        data: {
          status: "VERIFIED",
          verifiedAt: new Date(),
        },
      });

      revalidatePortfolioCache({ userId, domain: customDomain.domain });

      return NextResponse.json({
        success: true,
        customDomain: updatedDomain,
        message: dnsResult.message,
      });
    }

    // Update status to FAILED if verification attempt failed
    const updatedDomain = await prisma.customDomain.update({
      where: { id: customDomain.id },
      data: {
        status: "FAILED",
      },
    });

    revalidatePortfolioCache({ userId, domain: customDomain.domain });

    return NextResponse.json(
      {
        success: false,
        customDomain: updatedDomain,
        error: dnsResult.message,
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("POST /api/domains/[id]/verify error:", error);
    return NextResponse.json(
      { error: "An error occurred during DNS verification" },
      { status: 500 }
    );
  }
}
