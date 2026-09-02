import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const alt = "Portfolio Preview";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

interface Props {
  params: Promise<{
    username: string;
  }>;
}

export default async function Image({ params }: Props) {
  const { username: rawUsername } = await params;
  const username = decodeURIComponent(rawUsername).toLowerCase().trim();

  // Try finding user by username or custom domain
  let user = await prisma.user.findUnique({
    where: { username },
    select: {
      name: true,
      username: true,
      profile: {
        select: {
          fullName: true,
          headline: true,
        },
      },
      skills: {
        select: { name: true },
        take: 4,
      },
      portfolioSettings: {
        select: {
          themeColor: true,
          isPublished: true,
        },
      },
    },
  });

  if (!user) {
    const customDomain = await prisma.customDomain.findFirst({
      where: {
        domain: { in: [username, username.replace(/^www\./, "")] },
        status: { in: ["VERIFIED", "ACTIVE"] },
      },
      select: { userId: true },
    });

    if (customDomain) {
      user = await prisma.user.findUnique({
        where: { id: customDomain.userId },
        select: {
          name: true,
          username: true,
          profile: {
            select: {
              fullName: true,
              headline: true,
            },
          },
          skills: {
            select: { name: true },
            take: 4,
          },
          portfolioSettings: {
            select: {
              themeColor: true,
              isPublished: true,
            },
          },
        },
      });
    }
  }

  const name = user?.profile?.fullName || user?.name || user?.username || "Developer";
  const headline = user?.profile?.headline || "Professional Portfolio";
  const themeColor = user?.portfolioSettings?.themeColor || "#2563EB";
  const skillNames = user?.skills.map((s) => s.name).join(" • ") || "Developer Portfolio";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#030712",
          backgroundImage: `radial-gradient(circle at 50% 0%, ${themeColor}33 0%, rgba(3, 7, 18, 0.95) 70%)`,
          fontFamily: "sans-serif",
          color: "white",
          padding: "60px",
          position: "relative",
        }}
      >
        {/* Subtle grid pattern border */}
        <div
          style={{
            position: "absolute",
            inset: "20px",
            border: `1px solid ${themeColor}44`,
            borderRadius: "24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px",
            background: "rgba(15, 23, 42, 0.6)",
          }}
        >
          {/* Top Pill Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 20px",
              borderRadius: "9999px",
              backgroundColor: `${themeColor}22`,
              border: `1px solid ${themeColor}66`,
              color: themeColor,
              fontSize: "18px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "2px",
              marginBottom: "28px",
            }}
          >
            ✦ Portfolio
          </div>

          {/* User Name */}
          <div
            style={{
              fontSize: "56px",
              fontWeight: 800,
              letterSpacing: "-1px",
              textAlign: "center",
              color: "#ffffff",
              marginBottom: "16px",
              lineHeight: 1.1,
            }}
          >
            {name}
          </div>

          {/* Headline */}
          <div
            style={{
              fontSize: "26px",
              fontWeight: 500,
              color: "#94a3b8",
              textAlign: "center",
              maxWidth: "800px",
              marginBottom: "36px",
              lineHeight: 1.3,
            }}
          >
            {headline}
          </div>

          {/* Skills Line */}
          {skillNames && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 24px",
                borderRadius: "16px",
                backgroundColor: "rgba(30, 41, 59, 0.8)",
                border: "1px solid rgba(51, 65, 85, 0.8)",
                color: "#e2e8f0",
                fontSize: "20px",
                fontWeight: 600,
              }}
            >
              {skillNames}
            </div>
          )}

          {/* Footer Logo */}
          <div
            style={{
              position: "absolute",
              bottom: "32px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "18px",
              fontWeight: 700,
              color: "#64748b",
            }}
          >
            Powered by <span style={{ color: "#ffffff" }}>MyFolio</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
