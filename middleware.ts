import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { extractSubdomain, getRootDomain } from "@/lib/utils/subdomain";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const rawHostname =
    req.headers.get("host") || req.nextUrl.hostname;

  const hostname = rawHostname.toLowerCase().split(":")[0];

  // Vercel deployment / preview domains should behave like
  // the root application and must NOT be treated as a portfolio subdomain.
  //
  // Example:
  // myfolio-xxxxx.vercel.app
  // myfolio-git-main-xxxxx.vercel.app
  const isVercelHost =
    hostname.endsWith(".vercel.app") ||
    hostname === "vercel.app";

  // ------------------------------------------------------------
  // 1. Subdomain handling
  // ------------------------------------------------------------
  //
  // Example:
  // rajen.myfolio.com
  // rajen.localhost
  //
  // These should resolve to:
  // /rajen
  //
  // But Vercel domains must NOT go through this logic.
  const subdomain = extractSubdomain(hostname);

  if (subdomain && !isVercelHost) {
    // Skip static assets, Next.js internal paths, and API routes
    if (
      pathname.startsWith("/_next") ||
      pathname.startsWith("/api") ||
      pathname.includes(".")
    ) {
      return NextResponse.next();
    }

    // Rewrite:
    // rajen.myfolio.com
    //        ↓
    // /rajen
    const url = req.nextUrl.clone();

    url.pathname = `/${subdomain}${
      pathname === "/" ? "" : pathname
    }`;

    return NextResponse.rewrite(url);
  }

  // ------------------------------------------------------------
  // 2. Custom Domain handling
  // ------------------------------------------------------------
  //
  // Example:
  // rajenmandal.com
  // www.rajenmandal.com
  //
  // These are resolved through:
  // /[hostname]
  const rootDomain = getRootDomain()
    .toLowerCase()
    .trim();

  const isRootDomain =
    hostname === rootDomain ||
    hostname === `www.${rootDomain}` ||
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    isVercelHost;

  if (!isRootDomain) {
    // Skip static assets, Next.js internal paths, and API routes
    if (
      pathname.startsWith("/_next") ||
      pathname.startsWith("/api") ||
      pathname.includes(".")
    ) {
      return NextResponse.next();
    }

    // Rewrite custom domain request
    //
    // Example:
    // rajenmandal.com
    //        ↓
    // /rajenmandal.com
    const url = req.nextUrl.clone();

    url.pathname = `/${hostname}${
      pathname === "/" ? "" : pathname
    }`;

    return NextResponse.rewrite(url);
  }

  // ------------------------------------------------------------
  // 3. Authentication
  // ------------------------------------------------------------

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
  });

  // Protected routes
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/username")
  ) {
    if (!token) {
      const loginUrl = new URL(
        `/login?callbackUrl=${encodeURIComponent(pathname)}`,
        req.url
      );

      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated users away from
  // login and signup pages
  if (
    (pathname === "/login" || pathname === "/signup") &&
    token
  ) {
    const dashboardUrl = new URL("/dashboard", req.url);

    return NextResponse.redirect(dashboardUrl);
  }

  // ------------------------------------------------------------
  // 4. Default
  // ------------------------------------------------------------

  return NextResponse.next();
}

// ------------------------------------------------------------
// Middleware matcher
// ------------------------------------------------------------

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static
     * - _next/image
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};