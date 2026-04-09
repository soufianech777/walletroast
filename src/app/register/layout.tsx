import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Create Free Account",
  description:
    "Join 12,000+ people who stopped wasting money. Create your free WalletRoast account to track expenses, get roasted for bad spending habits, and start saving.",
  openGraph: {
    title: "Create Your Free WalletRoast Account",
    description:
      "Stop wasting money. Start tracking it. Join thousands of people who finally got honest about their spending and started saving real money.",
    url: "https://walletroast.com/register",
  },
  alternates: {
    canonical: "https://walletroast.com/register",
  },
}

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
