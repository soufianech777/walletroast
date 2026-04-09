import Link from "next/link"
import { Flame, ArrowLeft, Shield } from "lucide-react"

export default function PrivacyPolicyPage() {
  const sections = [
    {
      id: "overview",
      title: "1. Overview",
      content: `WalletRoast ("we", "us", or "our") is a personal finance application designed to help you track expenses, understand your spending habits, and improve your financial discipline. This Privacy Policy explains how we collect, use, store, and protect your information when you use our website and services.`,
    },
    {
      id: "data-collection",
      title: "2. Information We Collect",
      content: `We collect the following types of information:`,
      list: [
        "**Account Information**: Name, email address, and password when you create an account.",
        "**Financial Data**: Expense entries, budget settings, savings goals, and category preferences that you manually input into the app.",
        "**Usage Data**: How you interact with the app, including pages visited, features used, roast level preferences, and discipline scores.",
        "**Device Information**: Browser type, operating system, device type, screen resolution, and IP address for analytics and security purposes.",
        "**Local Storage Data**: Preferences, theme settings, and cached data stored locally on your device.",
      ],
    },
    {
      id: "how-we-use",
      title: "3. How We Use Your Information",
      content: `We use your information to:`,
      list: [
        "Provide and improve the WalletRoast service, including personalized insights and roasts.",
        "Calculate your discipline score and generate weekly reports.",
        "Detect spending patterns and identify potential money leaks.",
        "Send notifications and reminders related to your financial goals.",
        "Improve our algorithms and user experience through aggregated, anonymized analytics.",
        "Communicate important updates about the service.",
        "Prevent fraud and ensure security of your account.",
      ],
    },
    {
      id: "cookies",
      title: "4. Cookies & Local Storage",
      content: `WalletRoast uses browser local storage and cookies to:`,
      list: [
        "Keep you signed in across sessions.",
        "Store your theme preference (dark/light mode).",
        "Cache expense data for offline access (PWA functionality).",
        "Remember your sidebar and UI preferences.",
      ],
      footer:
        "We do not use third-party tracking cookies for advertising purposes. You can clear your local storage at any time through your browser settings.",
    },
    {
      id: "analytics",
      title: "5. Analytics",
      content: `We may use privacy-respecting analytics tools to understand how the app is used in aggregate. This helps us improve features and fix issues. Analytics data is anonymized and never sold to third parties. We do not build advertising profiles from your data.`,
    },
    {
      id: "user-content",
      title: "6. User-Generated Content",
      content: `If you use our Roast Social feature, you may post roasts, comments, and reactions that are visible to other users. Please be mindful that:`,
      list: [
        "Social posts may be visible to other WalletRoast users.",
        "You can delete your posts at any time.",
        "We do not share your actual financial data in social features — only content you explicitly choose to post.",
        "Anonymous posting options are available.",
      ],
    },
    {
      id: "third-party",
      title: "7. Third-Party Services",
      content: `WalletRoast may integrate with or rely on the following third-party services:`,
      list: [
        "**Authentication Providers**: For secure login (e.g., Google Sign-In).",
        "**Hosting & Infrastructure**: Cloud providers for hosting and data storage.",
        "**Analytics**: Privacy-focused analytics for usage insights.",
      ],
      footer:
        "Each third-party service has its own privacy policy. We only share the minimum data necessary for these services to function.",
    },
    {
      id: "data-retention",
      title: "8. Data Retention",
      content: `We retain your data for as long as your account is active. If you delete your account:`,
      list: [
        "Your personal data will be permanently deleted within 30 days.",
        "Anonymized, aggregated data may be retained for analytics purposes.",
        "Backups containing your data will be purged within 90 days.",
      ],
      footer:
        "You can request deletion of your data at any time by contacting us or through the Settings page in the app.",
    },
    {
      id: "security",
      title: "9. Security",
      content: `We take the security of your data seriously and implement industry-standard measures including:`,
      list: [
        "HTTPS encryption for all data in transit.",
        "Secure password hashing — we never store passwords in plain text.",
        "Regular security audits and vulnerability assessments.",
        "Access controls limiting who can access your data internally.",
      ],
      footer:
        "While we strive to protect your information, no method of transmission or storage is 100% secure. We encourage you to use a strong, unique password for your account.",
    },
    {
      id: "your-rights",
      title: "10. Your Rights",
      content: `Depending on your location, you may have the following rights:`,
      list: [
        "**Access**: Request a copy of the data we hold about you.",
        "**Correction**: Request correction of inaccurate data.",
        "**Deletion**: Request deletion of your personal data.",
        "**Portability**: Request your data in a machine-readable format.",
        "**Objection**: Object to certain types of data processing.",
      ],
      footer:
        "To exercise any of these rights, contact us at privacy@walletroast.com.",
    },
    {
      id: "children",
      title: "11. Children's Privacy",
      content: `WalletRoast is not intended for children under the age of 13. We do not knowingly collect personal information from children. If you believe we have collected data from a child, please contact us immediately and we will delete it.`,
    },
    {
      id: "changes",
      title: "12. Changes to This Policy",
      content: `We may update this Privacy Policy from time to time. When we do, we will update the "Last Updated" date at the top of this page and, for significant changes, notify you through the app or via email. We encourage you to review this policy periodically.`,
    },
    {
      id: "contact",
      title: "13. Contact Us",
      content: `If you have any questions, concerns, or requests about this Privacy Policy or your data, you can reach us at:`,
      list: [
        "**Email**: privacy@walletroast.com",
        "**Support**: Through the Settings page in the app",
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
        {/* Title */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/[0.08] border border-orange-500/20 text-orange-400 text-xs font-medium mb-5">
            <Shield className="w-3.5 h-3.5" />
            Legal
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-zinc-400 text-[15px]">
            Last updated: April 8, 2025
          </p>
        </div>

        {/* Table of Contents */}
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

        {/* Sections */}
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
              {section.footer && (
                <p className="text-[14px] text-zinc-500 leading-relaxed italic">
                  {section.footer}
                </p>
              )}
            </section>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 pt-10 border-t border-[var(--color-border)]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-[13px]">
              <Link
                href="/terms"
                className="text-zinc-500 hover:text-orange-400 transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/"
                className="text-zinc-500 hover:text-orange-400 transition-colors"
              >
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
