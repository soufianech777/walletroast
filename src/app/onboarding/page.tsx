"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Flame, DollarSign, Target, Zap, ChevronRight, ChevronLeft, Check, Briefcase } from "lucide-react"
import { createDefaultUser, seedDemoData } from "@/lib/store"
import type { RoastLevel } from "@/lib/types"

const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "MAD", symbol: "MAD", name: "Dirham" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
]

const roastOptions: { level: RoastLevel; emoji: string; title: string; desc: string; example: string; color: string; accent: string }[] = [
  {
    level: "soft", emoji: "😊", title: "Soft", desc: "Gentle, encouraging nudges",
    example: "You're spending a bit more than planned on food. Consider cooking at home.",
    color: "border-sky-500/25 bg-sky-500/[0.04] hover:border-sky-500/40", accent: "text-sky-400",
  },
  {
    level: "direct", emoji: "😐", title: "Direct", desc: "Clear, no-nonsense feedback",
    example: "You're 40% over your food budget. Cut delivery apps. Cook at home.",
    color: "border-amber-500/25 bg-amber-500/[0.04] hover:border-amber-500/40", accent: "text-amber-400",
  },
  {
    level: "brutal", emoji: "🔥", title: "Brutal", desc: "Sharp, aggressive, memorable",
    example: "Your kitchen is a museum. $800 on food? Your fridge is crying. Cook something.",
    color: "border-red-500/25 bg-red-500/[0.04] hover:border-red-500/40 ring-1 ring-red-500/10", accent: "text-red-400",
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [currency, setCurrency] = useState("USD")
  const [monthlyIncome, setMonthlyIncome] = useState("")
  const [savingsGoal, setSavingsGoal] = useState("")
  const [roastLevel, setRoastLevel] = useState<RoastLevel>("direct")
  const [employment, setEmployment] = useState("")
  const [situation, setSituation] = useState("")
  const [loading, setLoading] = useState(false)

  const steps = [
    { icon: DollarSign, title: "Income & Currency", subtitle: "Set your financial baseline" },
    { icon: Briefcase, title: "Employment & Situation", subtitle: "Tell us about your lifestyle" },
    { icon: Target, title: "Savings Goal", subtitle: "How much do you want to save?" },
    { icon: Zap, title: "Roast Level", subtitle: "Choose your feedback intensity" },
  ]

  const canProceed = () => {
    if (step === 0) return monthlyIncome !== "" && Number(monthlyIncome) > 0
    if (step === 1) return employment !== "" && situation !== ""
    if (step === 2) return savingsGoal !== "" && Number(savingsGoal) > 0
    return true
  }

  const handleComplete = () => {
    setLoading(true)
    const regData = typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("walletroast_reg") || '{"name":"Demo User","email":"demo@walletroast.com"}')
      : { name: "Demo User", email: "demo@walletroast.com" }

    createDefaultUser({ name: regData.name, email: regData.email, currency, monthlyIncome: Number(monthlyIncome), roastLevel, savingsGoal: Number(savingsGoal) })
    seedDemoData()
    setTimeout(() => router.push("/dashboard"), 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 hero-gradient relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-orange-600/[0.06] rounded-full blur-[200px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-orange-500/20">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Set Up Your Profile</h1>
          <p className="text-[var(--color-muted-foreground)] text-[13px]">Step {step + 1} of {steps.length}</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-3 mb-8">
          {steps.map((s, i) => (
            <div key={i} className="flex-1 flex items-center gap-2">
              <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${i <= step ? "bg-orange-500/20" : "bg-[var(--color-border)]"}`}>
                <motion.div
                  className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: i <= step ? "100%" : "0%" }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="glass-card p-7 sm:p-8 rounded-2xl border border-[var(--color-border)]">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <h2 className="text-[15px] font-bold mb-1 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center"><DollarSign className="w-4 h-4 text-orange-400" /></div>
                  Income & Currency
                </h2>
                <p className="text-[12px] text-[var(--color-muted-foreground)] mb-6 ml-[38px]">Set your financial baseline</p>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[12px] text-[var(--color-muted-foreground)] mb-2.5 font-semibold uppercase tracking-[0.05em]">Currency</label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {currencies.map((c) => (
                        <button key={c.code} onClick={() => setCurrency(c.code)}
                          className={`py-3 px-3 rounded-xl border text-center transition-all duration-200 hover:-translate-y-0.5 ${
                            currency === c.code
                              ? "border-orange-500/40 bg-orange-500/10 text-orange-400 shadow-sm shadow-orange-500/5"
                              : "border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:border-[var(--color-border-hover)] bg-[var(--color-secondary)]"
                          }`}>
                          <div className="font-bold text-[15px]">{c.symbol}</div>
                          <div className="text-[10px] mt-0.5 opacity-60 uppercase tracking-wider">{c.code}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[12px] text-[var(--color-muted-foreground)] mb-2 font-semibold uppercase tracking-[0.05em]">Monthly Income</label>
                    <div className="relative group">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)] group-focus-within:text-orange-400 transition-colors" />
                      <input type="number" value={monthlyIncome} onChange={(e) => setMonthlyIncome(e.target.value)} placeholder="4000"
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[var(--color-secondary)] border border-[var(--color-border)] text-[14px] placeholder:text-[var(--color-muted-foreground)]/50 focus:outline-none focus:border-orange-500/40 focus:ring-2 focus:ring-orange-500/10 transition-all" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <h2 className="text-[15px] font-bold mb-1 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center"><Briefcase className="w-4 h-4 text-orange-400" /></div>
                  Employment & Situation
                </h2>
                <p className="text-[12px] text-[var(--color-muted-foreground)] mb-6 ml-[38px]">This helps us tailor your roasts</p>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[12px] text-[var(--color-muted-foreground)] mb-2.5 font-semibold uppercase tracking-[0.05em]">Employment Status</label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        { value: "employed", label: "Employed", emoji: "💼" },
                        { value: "freelancer", label: "Freelancer", emoji: "🚀" },
                        { value: "student", label: "Student", emoji: "📚" },
                        { value: "unemployed", label: "Unemployed", emoji: "🔍" },
                        { value: "retired", label: "Retired", emoji: "🏖️" },
                        { value: "other", label: "Other", emoji: "✨" },
                      ].map((opt) => (
                        <button key={opt.value} onClick={() => setEmployment(opt.value)}
                          className={`py-3 px-3 rounded-xl border text-center transition-all duration-200 hover:-translate-y-0.5 ${
                            employment === opt.value
                              ? "border-orange-500/40 bg-orange-500/10 text-orange-400 shadow-sm shadow-orange-500/5"
                              : "border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:border-[var(--color-border-hover)] bg-[var(--color-secondary)]"
                          }`}>
                          <div className="text-lg mb-0.5">{opt.emoji}</div>
                          <div className="text-[11px] font-semibold">{opt.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] text-[var(--color-muted-foreground)] mb-2.5 font-semibold uppercase tracking-[0.05em]">Living Situation</label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        { value: "alone", label: "Living Alone", emoji: "🏠", desc: "Solo expenses" },
                        { value: "partner", label: "With Partner", emoji: "💑", desc: "Shared costs" },
                        { value: "family", label: "With Family", emoji: "👨‍👩‍👧‍👦", desc: "Family budget" },
                        { value: "roommates", label: "Roommates", emoji: "🏡", desc: "Split bills" },
                      ].map((opt) => (
                        <button key={opt.value} onClick={() => setSituation(opt.value)}
                          className={`p-3.5 rounded-xl border text-left transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-3 ${
                            situation === opt.value
                              ? "border-orange-500/40 bg-orange-500/10 shadow-sm shadow-orange-500/5"
                              : "border-[var(--color-border)] hover:border-[var(--color-border-hover)] bg-[var(--color-secondary)]"
                          }`}>
                          <span className="text-xl">{opt.emoji}</span>
                          <div>
                            <div className={`text-[12px] font-bold ${situation === opt.value ? "text-orange-400" : ""}`}>{opt.label}</div>
                            <div className="text-[10px] text-[var(--color-muted-foreground)]">{opt.desc}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <h2 className="text-[15px] font-bold mb-1 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center"><Target className="w-4 h-4 text-orange-400" /></div>
                  Monthly Savings Goal
                </h2>
                <p className="text-[12px] text-[var(--color-muted-foreground)] mb-6 ml-[38px]">How much do you want to save per month?</p>

                <div>
                  <label className="block text-[12px] text-[var(--color-muted-foreground)] mb-2 font-semibold uppercase tracking-[0.05em]">Target Amount</label>
                  <div className="relative group">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)] group-focus-within:text-orange-400 transition-colors" />
                    <input type="number" value={savingsGoal} onChange={(e) => setSavingsGoal(e.target.value)} placeholder="500"
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[var(--color-secondary)] border border-[var(--color-border)] text-[14px] placeholder:text-[var(--color-muted-foreground)]/50 focus:outline-none focus:border-orange-500/40 focus:ring-2 focus:ring-orange-500/10 transition-all" />
                  </div>
                  {monthlyIncome && savingsGoal && (
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-[var(--color-border)] overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${Number(savingsGoal) / Number(monthlyIncome) > 0.3 ? "bg-amber-500" : "bg-emerald-500"}`}
                          style={{ width: `${Math.min((Number(savingsGoal) / Number(monthlyIncome)) * 100, 100)}%` }} />
                      </div>
                      <span className="text-[12px] text-[var(--color-muted-foreground)] font-medium">
                        {((Number(savingsGoal) / Number(monthlyIncome)) * 100).toFixed(0)}%
                      </span>
                    </div>
                  )}
                  {monthlyIncome && savingsGoal && (
                    <p className="text-[11px] text-[var(--color-muted-foreground)] mt-2">
                      {Number(savingsGoal) / Number(monthlyIncome) > 0.3 ? "🎯 Ambitious goal!" : "✅ Very achievable!"}
                      {" "}That&apos;s {((Number(savingsGoal) / Number(monthlyIncome)) * 100).toFixed(0)}% of your income.
                    </p>
                  )}
                </div>

                <div className="mt-5">
                  <label className="block text-[11px] text-[var(--color-muted-foreground)] mb-2 font-medium">Quick Pick</label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[10, 20, 30].map((pct) => (
                      <button key={pct} onClick={() => setSavingsGoal(String(Math.round(Number(monthlyIncome) * pct / 100)))}
                        className={`py-2.5 px-3 rounded-xl border text-[12px] font-medium transition-all hover:-translate-y-0.5 ${
                          savingsGoal === String(Math.round(Number(monthlyIncome) * pct / 100))
                            ? "border-orange-500/40 bg-orange-500/10 text-orange-400"
                            : "border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:border-orange-500/30 hover:text-orange-400 bg-[var(--color-secondary)]"
                        }`}>
                        {pct}% = ${Math.round(Number(monthlyIncome || 0) * pct / 100)}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <h2 className="text-[15px] font-bold mb-1 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center"><Zap className="w-4 h-4 text-orange-400" /></div>
                  Choose Your Roast Level
                </h2>
                <p className="text-[12px] text-[var(--color-muted-foreground)] mb-6 ml-[38px]">Pick the feedback intensity you prefer</p>

                <div className="space-y-3">
                  {roastOptions.map((opt) => (
                    <button key={opt.level} onClick={() => setRoastLevel(opt.level)}
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 ${
                        roastLevel === opt.level ? opt.color + " ring-1 ring-orange-500/30" : "border-[var(--color-border)] hover:border-[var(--color-border-hover)] bg-[var(--color-secondary)]"
                      }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">{opt.emoji}</span>
                          <div>
                            <span className="font-bold text-[14px]">{opt.title}</span>
                            <span className="text-[11px] text-[var(--color-muted-foreground)] ml-2">{opt.desc}</span>
                          </div>
                        </div>
                        {roastLevel === opt.level && <Check className="w-5 h-5 text-orange-400" />}
                      </div>
                      <p className="text-[12px] text-[var(--color-foreground)]/60 italic leading-relaxed ml-[38px]">&ldquo;{opt.example}&rdquo;</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--color-border)]">
            <button onClick={() => setStep(Math.max(0, step - 1))}
              className={`flex items-center gap-1 px-4 py-2.5 rounded-xl text-[13px] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-secondary)] transition-all ${step === 0 ? "invisible" : ""}`}>
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            {step < steps.length - 1 ? (
              <button onClick={() => setStep(step + 1)} disabled={!canProceed()}
                className="btn-primary px-7 py-2.5 rounded-xl text-[13px] font-semibold flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleComplete} disabled={loading}
                className="btn-primary px-7 py-2.5 rounded-xl text-[13px] font-semibold flex items-center gap-2 disabled:opacity-50">
                {loading ? (
                  <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Setting up...</>
                ) : (
                  <>Start Roasting <Flame className="w-4 h-4" /></>
                )}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
