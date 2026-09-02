import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPortfolioAnalytics } from "@/lib/analytics/aggregate";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const rangeParam = searchParams.get("range") || "30";
    const days = parseInt(rangeParam, 10);
    const validDays = [7, 30, 90].includes(days) ? days : 30;

    // Strict security: query ONLY current authenticated user's analytics
    const analytics = await getPortfolioAnalytics(session.user.id, validDays);

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("GET /api/portfolio/analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch portfolio analytics" },
      { status: 500 }
    );
  }
}
