import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how WalletRoast collects, uses, and protects your personal and financial data. We value your privacy and are committed to transparency.",
  openGraph: {
    title: "Privacy Policy — WalletRoast",
    description:
      "How WalletRoast handles your data. Read our full privacy policy covering data collection, security, cookies, and your rights.",
    url: "https://walletroast.com/privacy",
  },
  alternates: {
    canonical: "https://walletroast.com/privacy",
  },
}

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
