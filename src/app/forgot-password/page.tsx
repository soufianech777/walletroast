"use client"

import Link from "next/link"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Flame, Mail, ArrowLeft, CheckCircle, Send } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulate sending reset email
    setTimeout(() => {
      setLoading(false)
      setSent(true)
    }, 1500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 hero-gradient relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-orange-600/[0.06] rounded-full blur-[200px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[420px] relative z-10"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-7">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">WalletRoast</span>
          </Link>
        </div>

        <div className="glass-card p-8 rounded-2xl border border-[var(--color-border)]">
          <AnimatePresence mode="wait">
            {!sent ? (
              <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0, y: -10 }}>
                {/* Header */}
                <div className="text-center mb-7">
                  <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-6 h-6 text-orange-400" />
                  </div>
                  <h1 className="text-xl font-bold tracking-tight mb-2">Reset your password</h1>
                  <p className="text-[13px] text-[var(--color-muted-foreground)] leading-relaxed">
                    Enter the email linked to your account and we&apos;ll send you a reset link.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-[12px] text-[var(--color-muted-foreground)] mb-2 font-semibold uppercase tracking-[0.05em]">
                      Email Address
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)] group-focus-within:text-orange-400 transition-colors" />
                      <input
                        type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[var(--color-secondary)] border border-[var(--color-border)] text-[14px] placeholder:text-[var(--color-muted-foreground)]/50 focus:outline-none focus:border-orange-500/40 focus:ring-2 focus:ring-orange-500/10 transition-all"
                        required autoFocus
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full py-3.5 btn-primary rounded-xl text-[14px] font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                        Sending reset link...
                      </span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Reset Link
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div key="success" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                {/* Success State */}
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight mb-2">Check your email</h2>
                  <p className="text-[13px] text-[var(--color-muted-foreground)] leading-relaxed mb-2">
                    We&apos;ve sent a password reset link to:
                  </p>
                  <p className="text-[14px] font-semibold text-orange-400 mb-6">{email}</p>

                  <div className="glass-card p-4 rounded-xl mb-6 text-left">
                    <p className="text-[12px] text-[var(--color-muted-foreground)] leading-relaxed">
                      <span className="font-semibold text-[var(--color-foreground)]">Didn&apos;t get the email?</span>{" "}
                      Check your spam folder, or{" "}
                      <button onClick={() => { setSent(false); setLoading(false) }}
                        className="text-orange-400 hover:text-orange-300 font-medium">
                        try again
                      </button>.
                    </p>
                  </div>

                  {/* Demo: direct link to reset page */}
                  <Link href="/reset-password"
                    className="block w-full py-3 btn-primary rounded-xl text-[13px] font-bold text-center">
                    Open Reset Page (Demo)
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Back to login */}
        <div className="text-center mt-6">
          <Link href="/login" className="inline-flex items-center gap-2 text-[13px] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
