import { MetadataRoute } from "next";
import { getRootDomain } from "@/lib/utils/subdomain";

export default function robots(): MetadataRoute.Robots {
  const rootDomain = getRootDomain();
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const baseUrl = `${protocol}://${rootDomain}`;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/dashboard/*",
          "/api/*",
          "/login",
          "/signup",
          "/username",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
