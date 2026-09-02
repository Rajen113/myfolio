import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Lightweight database query to verify DB connection readiness
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        status: "ready",
        database: "connected",
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Readiness check failed:", error);

    return NextResponse.json(
      {
        status: "unhealthy",
        database: "disconnected",
        timestamp: new Date().toISOString(),
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  }
}
