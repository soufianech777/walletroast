import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Setup Your Profile",
  description:
    "Set up your WalletRoast profile. Choose your roast level, set your monthly budget, and start your journey to financial honesty.",
  robots: { index: false, follow: false },
}

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
