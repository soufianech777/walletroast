"use client"

import Link from "next/link"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Flame, Lock, Eye, EyeOff, CheckCircle, ShieldCheck } from "lucide-react"

export default function ResetPasswordPage() {

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const passwordStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3
  const strengthColors = ["", "bg-red-500", "bg-amber-500", "bg-emerald-500"]
  const strengthLabels = ["", "Weak", "Good", "Strong"]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
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
            {!success ? (
              <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0, y: -10 }}>
                <div className="text-center mb-7">
                  <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="w-6 h-6 text-orange-400" />
                  </div>
                  <h1 className="text-xl font-bold tracking-tight mb-2">Set new password</h1>
                  <p className="text-[13px] text-[var(--color-muted-foreground)] leading-relaxed">
                    Choose a strong password to keep your account secure.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* New Password */}
                  <div>
                    <label className="block text-[12px] text-[var(--color-muted-foreground)] mb-2 font-semibold uppercase tracking-[0.05em]">
                      New Password
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)] group-focus-within:text-orange-400 transition-colors" />
                      <input
                        type={showPassword ? "text" : "password"} value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min. 6 characters"
                        className="w-full pl-11 pr-12 py-3.5 rounded-xl bg-[var(--color-secondary)] border border-[var(--color-border)] text-[14px] placeholder:text-[var(--color-muted-foreground)]/50 focus:outline-none focus:border-orange-500/40 focus:ring-2 focus:ring-orange-500/10 transition-all"
                        required minLength={6}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {password.length > 0 && (
                      <div className="mt-2.5 flex items-center gap-2">
                        <div className="flex-1 flex gap-1">
                          {[1, 2, 3].map(level => (
                            <div key={level} className={`h-1 flex-1 rounded-full transition-all ${passwordStrength >= level ? strengthColors[passwordStrength] : "bg-[var(--color-border)]"}`} />
                          ))}
                        </div>
                        <span className={`text-[10px] font-semibold ${passwordStrength === 3 ? "text-emerald-400" : passwordStrength === 2 ? "text-amber-400" : "text-red-400"}`}>
                          {strengthLabels[passwordStrength]}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-[12px] text-[var(--color-muted-foreground)] mb-2 font-semibold uppercase tracking-[0.05em]">
                      Confirm Password
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)] group-focus-within:text-orange-400 transition-colors" />
                      <input
                        type={showConfirm ? "text" : "password"} value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your password"
                        className={`w-full pl-11 pr-12 py-3.5 rounded-xl bg-[var(--color-secondary)] border text-[14px] placeholder:text-[var(--color-muted-foreground)]/50 focus:outline-none focus:ring-2 transition-all ${
                          confirmPassword.length > 0 && confirmPassword !== password
                            ? "border-red-500/40 focus:border-red-500/40 focus:ring-red-500/10"
                            : confirmPassword.length > 0 && confirmPassword === password
                            ? "border-emerald-500/40 focus:border-emerald-500/40 focus:ring-emerald-500/10"
                            : "border-[var(--color-border)] focus:border-orange-500/40 focus:ring-orange-500/10"
                        }`}
                        required minLength={6}
                      />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors">
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {confirmPassword.length > 0 && confirmPassword === password && (
                      <p className="mt-1.5 text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Passwords match
                      </p>
                    )}
                    {confirmPassword.length > 0 && confirmPassword !== password && (
                      <p className="mt-1.5 text-[11px] text-red-400 font-medium">Passwords do not match</p>
                    )}
                  </div>

                  {error && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-[12px] text-red-400 font-medium">
                      {error}
                    </div>
                  )}

                  <button type="submit" disabled={loading || password.length < 6 || password !== confirmPassword}
                    className="w-full py-3.5 btn-primary rounded-xl text-[14px] font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                        Resetting password...
                      </span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        Reset Password
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div key="success" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight mb-2">Password reset!</h2>
                  <p className="text-[13px] text-[var(--color-muted-foreground)] leading-relaxed mb-7">
                    Your password has been successfully updated. You can now sign in with your new password.
                  </p>
                  <Link href="/login"
                    className="block w-full py-3.5 btn-primary rounded-xl text-[14px] font-bold text-center">
                    Sign In Now
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
