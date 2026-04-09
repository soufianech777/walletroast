import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Forgot Password",
  description:
    "Reset your WalletRoast password. Enter your email and we'll send you instructions to regain access to your account.",
  robots: { index: false, follow: true },
  alternates: {
    canonical: "https://walletroast.com/forgot-password",
  },
}

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
