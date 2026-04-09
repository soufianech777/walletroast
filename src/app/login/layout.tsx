import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to WalletRoast and pick up where you left off. Track your expenses, check your discipline score, and get brutally honest financial insights.",
  openGraph: {
    title: "Sign In to WalletRoast",
    description:
      "Welcome back. Your wallet missed you. Sign in to continue tracking your spending and improving your financial discipline.",
    url: "https://walletroast.com/login",
  },
  alternates: {
    canonical: "https://walletroast.com/login",
  },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
