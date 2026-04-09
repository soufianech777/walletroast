import Link from "next/link"
import { Flame, ArrowLeft, Mail, MessageCircle, HelpCircle, Clock } from "lucide-react"

export default function ContactPage() {
  const faqs = [
    { q: "How do I reset my password?", a: "Go to the login page and click 'Forgot Password'. You'll receive an email with reset instructions.", link: "/forgot-password" },
    { q: "How do I delete my account?", a: "You can delete your account from Settings → Account → Delete Account. All data will be permanently removed within 30 days." },
    { q: "Is WalletRoast really free?", a: "Yes! The free plan includes expense tracking, 5 categories, discipline scoring, and soft roast mode. Pro is $9/month for power users." },
    { q: "Can I export my data?", a: "Data export is available for Pro users. Go to Settings → Export Data to download your expenses as CSV." },
  ]

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <nav className="border-b border-[var(--color-border)] bg-[var(--color-card)]/80 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <Flame className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">WalletRoast</span>
            </Link>
            <Link href="/" className="flex items-center gap-1.5 text-[13px] text-zinc-400 hover:text-white transition-colors font-medium">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
        {/* Title */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/[0.08] border border-orange-500/20 text-orange-400 text-xs font-medium mb-5">
            <Mail className="w-3.5 h-3.5" />
            Get in Touch
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">Contact Us</h1>
          <p className="text-zinc-400 text-[15px] leading-relaxed max-w-xl">
            Have a question, bug report, or feature request? We&apos;d love to hear from you. Choose the best way to reach us below.
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid sm:grid-cols-3 gap-5 mb-16">
          {[
            {
              icon: Mail,
              title: "Email",
              desc: "For general inquiries",
              action: "hello@walletroast.com",
              href: "mailto:hello@walletroast.com",
            },
            {
              icon: MessageCircle,
              title: "In-App Support",
              desc: "For account issues",
              action: "Settings → Help",
              href: "/login",
            },
            {
              icon: Clock,
              title: "Response Time",
              desc: "We typically respond",
              action: "Within 24 hours",
              href: null,
            },
          ].map((item) => (
            <div key={item.title} className="glass-card rounded-2xl p-6 text-center">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-5 h-5 text-orange-400" />
              </div>
              <h3 className="font-bold text-sm mb-1">{item.title}</h3>
              <p className="text-xs text-zinc-500 mb-3">{item.desc}</p>
              {item.href ? (
                <Link href={item.href} className="text-[13px] text-orange-400 hover:text-orange-300 transition-colors font-medium">
                  {item.action}
                </Link>
              ) : (
                <span className="text-[13px] text-orange-400 font-medium">{item.action}</span>
              )}
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div>
          <div className="flex items-center gap-2.5 mb-6">
            <HelpCircle className="w-5 h-5 text-orange-400" />
            <h2 className="text-xl font-bold tracking-tight">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="glass-card rounded-xl p-5">
                <h3 className="font-semibold text-[15px] mb-2 text-zinc-100">{faq.q}</h3>
                <p className="text-[14px] text-zinc-400 leading-relaxed">
                  {faq.a}
                  {faq.link && (
                    <>
                      {" "}
                      <Link href={faq.link} className="text-orange-400 hover:text-orange-300 transition-colors underline underline-offset-2">
                        Go there →
                      </Link>
                    </>
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-10 border-t border-[var(--color-border)]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-[13px]">
              <Link href="/privacy" className="text-zinc-500 hover:text-orange-400 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-zinc-500 hover:text-orange-400 transition-colors">Terms of Service</Link>
              <Link href="/blog" className="text-zinc-500 hover:text-orange-400 transition-colors">Blog</Link>
            </div>
            <p className="text-[12px] text-zinc-600">© {new Date().getFullYear()} WalletRoast. All rights reserved.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
