import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { extractSubdomain } from "@/lib/utils/subdomain";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hostname = req.headers.get("host") || req.nextUrl.hostname;

  // Extract subdomain if present
  const subdomain = extractSubdomain(hostname);

  if (subdomain) {
    // Skip static assets, Next.js internal paths, and API routes
    if (
      pathname.startsWith("/_next") ||
      pathname.startsWith("/api") ||
      pathname.includes(".")
    ) {
      return NextResponse.next();
    }

    // Rewrite internal URL to /[subdomain] portfolio route
    const url = req.nextUrl.clone();
    url.pathname = `/${subdomain}${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  }

  // --- ROOT DOMAIN AUTHENTICATION ROUTE PROTECTION ---
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });

  // Protect /dashboard and /username routes
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/username")) {
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated users away from /login and /signup to /dashboard
  if ((pathname === "/login" || pathname === "/signup") && token) {
    const dashboardUrl = new URL("/dashboard", req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
