import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the WalletRoast team. We're here to help with questions, bug reports, feature requests, and account support.",
  openGraph: {
    title: "Contact Us — WalletRoast",
    description: "Reach the WalletRoast team for support, questions, or feedback.",
    url: "https://walletroast.com/contact",
  },
  alternates: {
    canonical: "https://walletroast.com/contact",
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
