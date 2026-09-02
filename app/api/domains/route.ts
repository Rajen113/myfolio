import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateDomain } from "@/lib/utils/domain";
import { generateVerificationToken, getExpectedTxtRecordValue } from "@/lib/services/dns-verification";
import { revalidatePortfolioCache } from "@/lib/portfolio/cache";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customDomains = await prisma.customDomain.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ customDomains });
  } catch (error) {
    console.error("GET /api/domains error:", error);
    return NextResponse.json({ error: "Failed to fetch custom domains" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json().catch(() => ({}));
    const rawDomain = body.domain;

    const validation = validateDomain(rawDomain);
    if (!validation.valid || !validation.normalizedDomain) {
      return NextResponse.json({ error: validation.error || "Invalid domain" }, { status: 400 });
    }

    const domain = validation.normalizedDomain;

    // Check if domain is already registered in database
    const existingDomain = await prisma.customDomain.findUnique({
      where: { domain },
    });

    if (existingDomain) {
      if (existingDomain.userId === userId) {
        return NextResponse.json({
          customDomain: existingDomain,
          dnsInstructions: {
            txtName: `_myfolio.${domain}`,
            txtValue: getExpectedTxtRecordValue(existingDomain.verificationToken),
            cnameTarget: process.env.MYFOLIO_DOMAIN_TARGET || "cname.myfolio.com",
          },
          message: "Domain is already added to your account.",
        });
      }

      return NextResponse.json(
        { error: "This domain is already registered by another account." },
        { status: 400 }
      );
    }

    const verificationToken = generateVerificationToken();

    // Check if user has any existing custom domains to decide primary status
    const existingUserDomainsCount = await prisma.customDomain.count({
      where: { userId },
    });

    const customDomain = await prisma.customDomain.create({
      data: {
        userId,
        domain,
        verificationToken,
        status: "PENDING",
        isPrimary: existingUserDomainsCount === 0,
      },
    });

    revalidatePortfolioCache({ userId, domain });

    return NextResponse.json(
      {
        customDomain,
        dnsInstructions: {
          txtName: `_myfolio.${domain}`,
          txtValue: getExpectedTxtRecordValue(verificationToken),
          cnameTarget: process.env.MYFOLIO_DOMAIN_TARGET || "cname.myfolio.com",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/domains error:", error);
    return NextResponse.json({ error: "Failed to add custom domain" }, { status: 500 });
  }
}
