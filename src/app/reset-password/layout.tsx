import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Reset Password",
  description:
    "Create a new password for your WalletRoast account.",
  robots: { index: false, follow: true },
  alternates: {
    canonical: "https://walletroast.com/reset-password",
  },
}

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
