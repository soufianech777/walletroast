import type { Metadata, Viewport } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import "./globals.css"

const SITE_URL = "https://walletroast.com"
const SITE_NAME = "WalletRoast"
const SITE_DESCRIPTION = "The brutally honest personal finance app. Track expenses, get roasted for bad spending habits, and actually fix your money. Used by 12,000+ people who are tired of being broke."
const OG_IMAGE = `${SITE_URL}/og-image.svg`

export const metadata: Metadata = {
  // ─── Core Meta ───
  title: {
    default: "WalletRoast — Stop Being Broke. Start Being Honest.",
    template: "%s | WalletRoast",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "personal finance app",
    "expense tracker",
    "budget app",
    "financial coach",
    "money management",
    "spending tracker",
    "budget planner",
    "finance roast",
    "discipline score",
    "money saving app",
    "expense manager",
    "financial planning",
    "budget tracker free",
    "personal budget",
    "money tracker",
    "spending habits",
    "financial wellness",
    "save money app",
    "debt tracker",
    "financial goals",
  ],
  applicationName: SITE_NAME,
  authors: [{ name: "WalletRoast Team", url: SITE_URL }],
  creator: "WalletRoast",
  publisher: "WalletRoast",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  category: "finance",

  // ─── Open Graph (Facebook, LinkedIn, Discord) ───
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "WalletRoast — Stop Being Broke. Start Being Honest.",
    description: SITE_DESCRIPTION,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "WalletRoast — The brutally honest personal finance app",
        type: "image/png",
      },
    ],
  },

  // ─── Twitter Card ───
  twitter: {
    card: "summary_large_image",
    site: "@walletroast",
    creator: "@walletroast",
    title: "WalletRoast — Stop Being Broke. Start Being Honest.",
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },

  // ─── Robots ───
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // ─── Verification (replace with real tokens when you have them) ───
  verification: {
    google: "j27XZ-BYa1OVjXW2DHTFBrTnP8jmN0KOx1YZroHWUTQ",
    // yandex: "your-yandex-verification",
    // yahoo: "your-yahoo-verification",
  },

  // ─── Alternate / Canonical ───
  alternates: {
    canonical: SITE_URL,
  },

  // ─── PWA / Icons ───
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/icons/icon.svg",
    apple: [
      { url: "/icons/icon-192.png", sizes: "192x192" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: SITE_NAME,
  },

  // ─── Other ───
  other: {
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#f97316",
    "msapplication-config": "/browserconfig.xml",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0c" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: "dark light",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // JSON-LD Structured Data for SoftwareApplication
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "WalletRoast",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web, Android, iOS",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    image: OG_IMAGE,
    author: {
      "@type": "Organization",
      name: "WalletRoast",
      url: SITE_URL,
    },
    offers: [
      {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        name: "Free Plan",
        description: "Basic expense tracking with soft roast mode",
      },
      {
        "@type": "Offer",
        price: "9",
        priceCurrency: "USD",
        name: "Pro Plan",
        description: "Unlimited categories, all roast levels, advanced insights, weekly reports",
      },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "2847",
      bestRating: "5",
      worstRating: "1",
    },
    featureList: [
      "Expense Tracking",
      "Brutal AI Insights",
      "Discipline Score",
      "Budget Control",
      "Smart Goals",
      "Roast Mode (Soft, Direct, Brutal)",
      "Social Leaderboard",
      "Weekly Reports",
      "Money Leak Detection",
    ],
  }

  // JSON-LD for Organization
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "WalletRoast",
    url: SITE_URL,
    logo: `${SITE_URL}/icons/icon-512.png`,
    sameAs: [
      "https://twitter.com/walletroast",
      "https://instagram.com/walletroast",
      "https://tiktok.com/@walletroast",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      url: `${SITE_URL}/support`,
    },
  }

  // JSON-LD for WebSite (enables sitelinks search box in Google)
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "WalletRoast",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  }

  // FAQ Schema for common questions (boosts rich snippets)
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is WalletRoast?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "WalletRoast is a personal finance app that gives you brutally honest insights about your spending habits. It tracks your expenses, calculates a discipline score, and roasts you for bad financial decisions to help you save more money.",
        },
      },
      {
        "@type": "Question",
        name: "Is WalletRoast free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! WalletRoast has a free plan that includes basic expense tracking, 5 categories, discipline score, and soft roast mode. The Pro plan at $9/month unlocks unlimited categories, all roast levels, advanced insights, and weekly reports.",
        },
      },
      {
        "@type": "Question",
        name: "How does the Roast Mode work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "WalletRoast analyzes your spending patterns and delivers personalized feedback at three intensity levels: Soft (gentle suggestions), Direct (no-nonsense advice), and Brutal (harsh truth that hits hard). You choose the level that motivates you most.",
        },
      },
      {
        "@type": "Question",
        name: "What is the Discipline Score?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The Discipline Score is a rating from 0-100 that measures your real financial discipline based on your spending patterns, budget adherence, and savings habits. It updates weekly and helps you track your progress toward better money management.",
        },
      },
      {
        "@type": "Question",
        name: "Can I use WalletRoast on my phone?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! WalletRoast works as a Progressive Web App (PWA) on any device. You can install it on your phone from the browser and use it offline. An Android APK is also available for download.",
        },
      },
    ],
  }

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link rel="icon" type="image/svg+xml" href="/icons/icon.svg" />
        <link rel="shortcut icon" type="image/svg+xml" href="/icons/icon.svg" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </head>
      <body className="antialiased noise-bg" suppressHydrationWarning>
        <ClerkProvider>
          {children}
        </ClerkProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then(reg => console.log('SW registered:', reg.scope))
                    .catch(err => console.log('SW failed:', err));
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
