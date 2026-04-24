"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  AlertTriangle, TrendingDown, ChevronDown, ChevronUp,
  Zap, X, ShieldAlert, Flame, Scissors
} from "lucide-react"
import { getUser, getExpenses, getCategories } from "@/lib/store"
import { detectMoneyLeaks, type MoneyLeak } from "@/lib/engines/leak-detector"
import { formatCurrency } from "@/lib/utils"

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } } }

function SeverityBadge({ severity }: { severity: MoneyLeak["severity"] }) {
  const config = {
    low: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20", label: "Low" },
    medium: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20", label: "Medium" },
    high: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20", label: "High" },
  }
  const c = config[severity]
  return (
    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${c.bg} ${c.text} ${c.border}`}>
      {c.label}
    </span>
  )
}

function LeakCard({ leak, currency, _index }: { leak: MoneyLeak; currency: string; _index: number }) {
  const [expanded, setExpanded] = useState(false)
  const [showFix, setShowFix] = useState(false)

  const severityColor = {
    low: "border-amber-500/15 hover:border-amber-500/30",
    medium: "border-orange-500/15 hover:border-orange-500/30",
    high: "border-red-500/20 hover:border-red-500/35 animate-pulse-glow",
  }
  const severityGlow = {
    low: "",
    medium: "",
    high: "shadow-[0_0_20px_rgba(239,68,68,0.08)]",
  }

  return (
    <motion.div
      variants={fadeUp}
      className={`glass-card rounded-2xl overflow-hidden border ${severityColor[leak.severity]} ${severityGlow[leak.severity]} transition-all duration-300`}
    >
      <div className="p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
              leak.severity === "high" ? "bg-red-500/10" : leak.severity === "medium" ? "bg-orange-500/10" : "bg-amber-500/10"
            }`}>
              {leak.categoryIcon || "💸"}
            </div>
            <div>
              <h3 className="font-bold text-[14px] leading-tight">{leak.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <SeverityBadge severity={leak.severity} />
                <span className="text-[10px] text-[var(--color-muted-foreground)]">{leak.occurrences} occurrences · {leak.timeframe}</span>
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className={`text-lg font-black tracking-tight ${
              leak.severity === "high" ? "text-red-400" : leak.severity === "medium" ? "text-orange-400" : "text-amber-400"
            }`}>
              -{formatCurrency(leak.monthlyLoss, currency)}
            </p>
            <p className="text-[10px] text-[var(--color-muted-foreground)]">/month</p>
          </div>
        </div>

        {/* Explanation */}
        <p className="text-[13px] text-[var(--color-muted-foreground)] leading-relaxed mb-4">{leak.explanation}</p>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFix(!showFix)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all duration-200 hover:-translate-y-0.5 ${
              showFix
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "btn-primary"
            }`}
          >
            {showFix ? <><X className="w-3.5 h-3.5" /> Close</> : <><Scissors className="w-3.5 h-3.5" /> Fix This</>}
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-[12px] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] bg-[var(--color-secondary)] hover:bg-[var(--color-border)] transition-all"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            Details
          </button>
        </div>
      </div>

      {/* Fix Suggestions Panel */}
      <AnimatePresence>
        {showFix && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0 border-t border-[var(--color-border)]/50 mt-0 pt-4">
              <p className="text-[11px] text-emerald-400 uppercase tracking-[0.15em] font-bold mb-3">Suggested Actions</p>
              <div className="space-y-2">
                {leak.fixSuggestions.map((suggestion, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/10"
                  >
                    <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-[12px] text-[var(--color-foreground)]/80 leading-relaxed">{suggestion}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Details Panel */}
      <AnimatePresence>
        {expanded && !showFix && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 sm:px-6 pb-5 sm:pb-6 border-t border-[var(--color-border)]/50 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="stat-card text-center py-3">
                  <p className="text-[10px] text-[var(--color-muted-foreground)] uppercase tracking-wider mb-1">Type</p>
                  <p className="text-[12px] font-semibold capitalize">{leak.type.replace(/_/g, " ")}</p>
                </div>
                <div className="stat-card text-center py-3">
                  <p className="text-[10px] text-[var(--color-muted-foreground)] uppercase tracking-wider mb-1">Category</p>
                  <p className="text-[12px] font-semibold">{leak.categoryName}</p>
                </div>
                <div className="stat-card text-center py-3">
                  <p className="text-[10px] text-[var(--color-muted-foreground)] uppercase tracking-wider mb-1">Yearly Cost</p>
                  <p className="text-[12px] font-bold text-red-400">{formatCurrency(leak.monthlyLoss * 12, currency)}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function LeaksPage() {
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setUser(getUser()); setMounted(true) }, [])

  const leakData = useMemo(() => {
    if (!user || !mounted) return null
    const expenses = getExpenses()
    const categories = getCategories()
    return detectMoneyLeaks(expenses, categories, user.currency)
  }, [user, mounted])

  if (!mounted || !user || !leakData) {
    return <div className="space-y-5">{[1,2,3].map(i => <div key={i} className="h-36 bg-[var(--color-secondary)] rounded-2xl animate-pulse" />)}</div>
  }

  return (
    <motion.div className="space-y-6" initial="hidden" animate="visible" variants={stagger}>
      {/* Header */}
      <motion.div variants={fadeUp}>
        <p className="text-xs font-bold text-red-400 uppercase tracking-[0.2em] mb-1">Money Leak Detector</p>
        <h1 className="text-2xl sm:text-[1.75rem] font-bold tracking-tight">Hidden Money Leaks</h1>
        <p className="text-[var(--color-muted-foreground)] text-xs mt-1">Small expenses that silently drain your wallet</p>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card border-red-500/15">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] text-[var(--color-muted-foreground)] uppercase tracking-[0.15em] font-semibold">Total Monthly Leak</p>
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-red-400" />
            </div>
          </div>
          <p className="text-2xl font-black text-red-400 tracking-tight">{formatCurrency(leakData.totalMonthlyLoss, user.currency)}</p>
          <p className="text-[11px] text-[var(--color-muted-foreground)] mt-1">That&apos;s {formatCurrency(leakData.totalMonthlyLoss * 12, user.currency)}/year</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] text-[var(--color-muted-foreground)] uppercase tracking-[0.15em] font-semibold">Leaks Found</p>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <p className="text-2xl font-black tracking-tight">{leakData.leakCount}</p>
          <p className="text-[11px] text-[var(--color-muted-foreground)] mt-1">
            {leakData.leaks.filter(l => l.severity === "high").length} high severity
          </p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] text-[var(--color-muted-foreground)] uppercase tracking-[0.15em] font-semibold">Biggest Leak</p>
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Flame className="w-4 h-4 text-orange-400" />
            </div>
          </div>
          {leakData.worstLeak ? (
            <>
              <p className="text-2xl font-black text-orange-400 tracking-tight">{formatCurrency(leakData.worstLeak.monthlyLoss, user.currency)}</p>
              <p className="text-[11px] text-[var(--color-muted-foreground)] mt-1 truncate">{leakData.worstLeak.title}</p>
            </>
          ) : (
            <p className="text-lg font-bold text-emerald-400">None! 🎉</p>
          )}
        </div>
      </motion.div>

      {/* Warning Banner */}
      {leakData.totalMonthlyLoss > 0 && (
        <motion.div variants={fadeUp}>
          <div className="rounded-2xl bg-gradient-to-r from-red-500/[0.06] to-orange-500/[0.04] border border-red-500/15 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0 animate-pulse-glow">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="font-bold text-[14px] text-red-400 mb-1">
                You are losing {formatCurrency(leakData.totalMonthlyLoss, user.currency)}/month on hidden spending
              </p>
              <p className="text-[12px] text-[var(--color-muted-foreground)]">
                That&apos;s {formatCurrency(leakData.totalMonthlyLoss * 12, user.currency)} per year going to waste. Click &quot;Fix This&quot; on each leak to see how to stop the bleeding.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Leak Cards */}
      {leakData.leaks.length > 0 ? (
        <div className="space-y-4">
          {leakData.leaks.map((leak, i) => (
            <LeakCard key={leak.id} leak={leak} currency={user.currency} index={i} />
          ))}
        </div>
      ) : (
        <motion.div variants={fadeUp} className="glass-card p-14 rounded-2xl text-center">
          <div className="text-4xl mb-4">🎉</div>
          <p className="text-base font-bold text-emerald-400 mb-2">No Money Leaks Detected!</p>
          <p className="text-[var(--color-muted-foreground)] text-sm">Your spending patterns look clean. Keep it up.</p>
        </motion.div>
      )}
    </motion.div>
  )
}
