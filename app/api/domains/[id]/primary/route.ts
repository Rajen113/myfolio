import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const customDomain = await prisma.customDomain.findFirst({
      where: { id, userId },
    });

    if (!customDomain) {
      return NextResponse.json({ error: "Custom domain not found" }, { status: 404 });
    }

    if (customDomain.status !== "VERIFIED" && customDomain.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Only verified or active domains can be set as primary." },
        { status: 400 }
      );
    }

    // Unset primary on all other domains for this user
    await prisma.customDomain.updateMany({
      where: { userId, isPrimary: true },
      data: { isPrimary: false },
    });

    // Set selected domain as primary
    const updated = await prisma.customDomain.update({
      where: { id: customDomain.id },
      data: { isPrimary: true, status: "ACTIVE" },
    });

    return NextResponse.json({
      success: true,
      customDomain: updated,
      message: `${updated.domain} set as your primary custom domain.`,
    });
  } catch (error) {
    console.error("POST /api/domains/[id]/primary error:", error);
    return NextResponse.json({ error: "Failed to update primary domain" }, { status: 500 });
  }
}
