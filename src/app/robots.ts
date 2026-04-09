import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://walletroast.com"

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
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
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
