import type { MetadataRoute } from "next"

export const dynamic = "force-static"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://walletroast.com"

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/register", "/privacy", "/terms", "/contact"],
        disallow: [
          "/api/",
          "/admin",
          "/dashboard",
          "/expenses",
          "/budgets",
          "/daily-roast",
          "/insights",
          "/leaks",
          "/report",
          "/goals",
          "/settings",
          "/notifications",
          "/social",
          "/onboarding",
          "/forgot-password",
          "/reset-password",
          "/_next/",
          "/icon.png",
        ],
      },
      // Block all known bad bots
      {
        userAgent: [
          "AhrefsBot",
          "SemrushBot",
          "MJ12bot",
          "DotBot",
          "PetalBot",
          "BLEXBot",
          "MegaIndex",
        ],
        disallow: ["/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
