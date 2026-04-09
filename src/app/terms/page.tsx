import Link from "next/link"
import { Flame, ArrowLeft, FileText } from "lucide-react"

export default function TermsPage() {
  const sections = [
    {
      id: "acceptance",
      title: "1. Acceptance of Terms",
      content: `By accessing or using WalletRoast ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service. We reserve the right to update these terms at any time, and continued use constitutes acceptance of any changes.`,
    },
    {
      id: "service",
      title: "2. Description of Service",
      content: `WalletRoast is a personal finance management application that helps users track expenses, set budgets, monitor financial goals, and receive personalized insights about spending habits. The Service includes both free and paid subscription tiers.`,
    },
    {
      id: "accounts",
      title: "3. User Accounts",
      content: `To use certain features, you must create an account. You are responsible for:`,
      list: [
        "Providing accurate and complete information during registration.",
        "Maintaining the security of your password and account credentials.",
        "All activities that occur under your account.",
        "Notifying us immediately of any unauthorized use of your account.",
      ],
    },
    {
      id: "acceptable-use",
      title: "4. Acceptable Use",
      content: `You agree not to use WalletRoast to:`,
      list: [
        "Violate any applicable laws or regulations.",
        "Post harmful, offensive, or misleading content in social features.",
        "Attempt to gain unauthorized access to other accounts or systems.",
        "Interfere with or disrupt the Service or its infrastructure.",
        "Use automated tools to scrape or collect data from the Service.",
        "Impersonate another person or entity.",
      ],
    },
    {
      id: "content",
      title: "5. User Content",
      content: `You retain ownership of any content you create on WalletRoast, including expense entries, budget configurations, and social posts. By posting content to public areas (such as Roast Social), you grant WalletRoast a non-exclusive, royalty-free license to display that content within the Service. You can delete your content at any time.`,
    },
    {
      id: "subscriptions",
      title: "6. Subscriptions & Payments",
      content: `WalletRoast offers free and Pro subscription plans:`,
      list: [
        "**Free Plan**: Basic features with limited categories and soft roast mode.",
        "**Pro Plan ($9/month)**: Unlimited categories, all roast levels, advanced insights, weekly reports, and priority support.",
        "Subscriptions renew automatically unless cancelled before the renewal date.",
        "Refund requests are handled on a case-by-case basis within 14 days of purchase.",
      ],
    },
    {
      id: "disclaimers",
      title: "7. Disclaimers",
      content: `WalletRoast is a financial tracking and awareness tool, not a licensed financial advisor:`,
      list: [
        "The insights, roasts, and recommendations provided are for educational and entertainment purposes only.",
        "We do not provide professional financial, investment, tax, or legal advice.",
        "You should consult qualified professionals for financial decisions.",
        'The Service is provided "as is" without warranties of any kind.',
      ],
    },
    {
      id: "liability",
      title: "8. Limitation of Liability",
      content: `To the maximum extent permitted by law, WalletRoast shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service. Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.`,
    },
    {
      id: "termination",
      title: "9. Termination",
      content: `We may suspend or terminate your account if you violate these Terms. You may also delete your account at any time through the Settings page. Upon termination, your right to use the Service ceases immediately, and we will delete your data in accordance with our Privacy Policy.`,
    },
    {
      id: "governing-law",
      title: "10. Governing Law",
      content: `These Terms are governed by applicable law in the jurisdiction where WalletRoast operates. Any disputes arising from these Terms will be resolved through good-faith negotiation first, and if necessary, through binding arbitration.`,
    },
    {
      id: "contact",
      title: "11. Contact",
      content: `For questions about these Terms, contact us at:`,
      list: [
        "**Email**: legal@walletroast.com",
        "**Website**: walletroast.com",
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* ─── Header ─── */}
      <nav className="border-b border-[var(--color-border)] bg-[var(--color-card)]/80 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <Flame className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">WalletRoast</span>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-1.5 text-[13px] text-zinc-400 hover:text-white transition-colors font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Content ─── */}
      <main className="max-w-4xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/[0.08] border border-orange-500/20 text-orange-400 text-xs font-medium mb-5">
            <FileText className="w-3.5 h-3.5" />
            Legal
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
            Terms of Service
          </h1>
          <p className="text-zinc-400 text-[15px]">
            Last updated: April 8, 2025
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 sm:p-7 mb-12">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-4">
            Table of Contents
          </h2>
          <nav className="grid sm:grid-cols-2 gap-2">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="text-[13px] text-zinc-400 hover:text-orange-400 transition-colors py-1 flex items-center gap-2"
              >
                <span className="w-1 h-1 rounded-full bg-orange-500/40 shrink-0" />
                {section.title}
              </a>
            ))}
          </nav>
        </div>

        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-20">
              <h2 className="text-xl font-bold tracking-tight mb-4 text-zinc-100">
                {section.title}
              </h2>
              <p className="text-[15px] text-zinc-400 leading-relaxed mb-4">
                {section.content}
              </p>
              {section.list && (
                <ul className="space-y-2.5 mb-4">
                  {section.list.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-[14px] text-zinc-400 leading-relaxed"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500/50 mt-2 shrink-0" />
                      <span
                        dangerouslySetInnerHTML={{
                          __html: item.replace(
                            /\*\*(.*?)\*\*/g,
                            '<strong class="text-zinc-200 font-semibold">$1</strong>'
                          ),
                        }}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <div className="mt-16 pt-10 border-t border-[var(--color-border)]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-[13px]">
              <Link href="/privacy" className="text-zinc-500 hover:text-orange-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/" className="text-zinc-500 hover:text-orange-400 transition-colors">
                Home
              </Link>
            </div>
            <p className="text-[12px] text-zinc-600">
              © {new Date().getFullYear()} WalletRoast. All rights reserved.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
