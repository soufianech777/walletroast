import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read the WalletRoast Terms of Service. Understand your rights and responsibilities when using our personal finance tracking application.",
  openGraph: {
    title: "Terms of Service — WalletRoast",
    description:
      "Terms of Service for the WalletRoast personal finance app.",
    url: "https://walletroast.com/terms",
  },
  alternates: {
    canonical: "https://walletroast.com/terms",
  },
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
