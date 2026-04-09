"use client"

import Script from "next/script"
import { Analytics as VercelAnalytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

export function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID

  return (
    <>
      {/* Vercel Analytics — auto-enabled on Vercel */}
      <VercelAnalytics />
      <SpeedInsights />

      {/* GA4 — only loads if NEXT_PUBLIC_GA_ID is set */}
      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', {
                page_title: document.title,
                page_location: window.location.href,
              });
            `}
          </Script>
        </>
      )}
    </>
  )
}
