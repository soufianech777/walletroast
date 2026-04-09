"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useSignIn } from "@clerk/nextjs"
import { Flame, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, BarChart3, TrendingDown } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { signIn } = useSignIn()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      const user = localStorage.getItem("walletroast_user")
      router.push(user ? "/dashboard" : "/onboarding")
    }, 800)
  }

  return (
    <div className="min-h-screen flex">
      {/* ─── Left Panel — Decorative ─── */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-[#050507]">
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-orange-600/[0.08] rounded-full blur-[200px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-red-600/[0.06] rounded-full blur-[160px] pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16 w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <Link href="/" className="inline-flex items-center gap-2.5 mb-12">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/25">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">WalletRoast</span>
            </Link>

            <h2 className="text-3xl xl:text-4xl font-black tracking-tight text-white leading-tight mb-4">
              Welcome back.{" "}
              <span className="gradient-text-fire">Your wallet missed you.</span>
            </h2>
            <p className="text-zinc-400 text-[15px] leading-relaxed mb-10 max-w-sm">
              Pick up right where you left off. Your expenses are waiting to be roasted.
            </p>

            {/* Mini dashboard preview */}
            <div className="space-y-3">
              {[
                { icon: TrendingDown, label: "Expenses tracked this month", value: "47 entries", color: "text-orange-400", bg: "bg-orange-500/10" },
                { icon: BarChart3, label: "Your discipline score", value: "72 / 100", color: "text-emerald-400", bg: "bg-emerald-500/10" },
                { icon: Sparkles, label: "Money saved so far", value: "$1,240", color: "text-amber-400", bg: "bg-amber-500/10" },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                >
                  <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <div className="flex-1">
                    <span className="text-[11px] text-zinc-500">{item.label}</span>
                    <p className={`text-[14px] font-bold ${item.color}`}>{item.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ─── Right Panel — Form ─── */}
      <div className="flex-1 flex items-center justify-center px-5 sm:px-8 py-12 bg-[var(--color-background)]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-[420px]"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">WalletRoast</span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight mb-2">Welcome back</h1>
            <p className="text-[var(--color-muted-foreground)] text-[14px]">
              Your finances missed the tough love
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-[12px] text-[var(--color-muted-foreground)] mb-2 font-semibold uppercase tracking-[0.05em]">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)] group-focus-within:text-orange-400 transition-colors" />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="off" data-lpignore="true" data-form-type="other"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[var(--color-secondary)] border border-[var(--color-border)] text-[14px] placeholder:text-[var(--color-muted-foreground)]/50 focus:outline-none focus:border-orange-500/40 focus:ring-2 focus:ring-orange-500/10 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[12px] text-[var(--color-muted-foreground)] font-semibold uppercase tracking-[0.05em]">Password</label>
                <Link href="/forgot-password" className="text-[11px] text-orange-400 hover:text-orange-300 font-medium transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)] group-focus-within:text-orange-400 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password" data-lpignore="true" data-form-type="other"
                  className="w-full pl-11 pr-12 py-3.5 rounded-xl bg-[var(--color-secondary)] border border-[var(--color-border)] text-[14px] placeholder:text-[var(--color-muted-foreground)]/50 focus:outline-none focus:border-orange-500/40 focus:ring-2 focus:ring-orange-500/10 transition-all"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full py-3.5 btn-primary rounded-xl text-[14px] font-bold disabled:opacity-50 flex items-center justify-center gap-2 group">
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Signing in...
                </span>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[var(--color-border)]" />
            <span className="text-[11px] text-[var(--color-muted-foreground)] font-medium">or</span>
            <div className="flex-1 h-px bg-[var(--color-border)]" />
          </div>

          {/* Google */}
          <button
            onClick={() => signIn?.authenticateWithRedirect({ strategy: "oauth_google", redirectUrl: "/sso-callback", redirectUrlComplete: "/dashboard" })}
            className="w-full py-3 rounded-xl border border-[var(--color-border)] text-[13px] font-semibold hover:bg-[var(--color-secondary)] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>

          {/* Sign up link */}
          <p className="text-center mt-6 text-[13px] text-[var(--color-muted-foreground)]">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-orange-400 hover:text-orange-300 font-semibold transition-colors">Sign up free</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
