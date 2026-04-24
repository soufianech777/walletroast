"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import {
  Calendar, TrendingDown, DollarSign, Flame,
  ArrowUpRight, ArrowDownRight, BarChart3, Zap, Target, ChevronRight
} from "lucide-react"
import { getUser, getExpenses, getBudgets, getCategories } from "@/lib/store"
import { calculateDisciplineScore } from "@/lib/engines/discipline-score"
import { generateWeeklyReport } from "@/lib/engines/weekly-report"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } } }

function GradeRing({ grade, label }: { grade: string; label: string }) {
  const colors: Record<string, { stroke: string; text: string; bg: string }> = {
    A: { stroke: "#10b981", text: "text-emerald-400", bg: "bg-emerald-500/10" },
    B: { stroke: "#3b82f6", text: "text-blue-400", bg: "bg-blue-500/10" },
    C: { stroke: "#f59e0b", text: "text-amber-400", bg: "bg-amber-500/10" },
    D: { stroke: "#f97316", text: "text-orange-400", bg: "bg-orange-500/10" },
    F: { stroke: "#ef4444", text: "text-red-400", bg: "bg-red-500/10" },
  }
  const c = colors[grade] || colors.C
  const scores: Record<string, number> = { A: 95, B: 78, C: 60, D: 40, F: 20 }
  const score = scores[grade] || 50
  const circumference = 2 * Math.PI * 46
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[120px] h-[120px]">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" stroke="var(--color-border)" strokeWidth="5" fill="none" />
          <motion.circle
            cx="50" cy="50" r="46" stroke={c.stroke} strokeWidth="5" fill="none"
            strokeLinecap="round" strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-[2.5rem] font-black leading-none ${c.text}`}>{grade}</span>
        </div>
      </div>
      <span className={`text-sm font-bold mt-2 ${c.text}`}>{label}</span>
    </div>
  )
}

export default function ReportPage() {
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setUser(getUser()); setMounted(true) }, [])

  const report = useMemo(() => {
    if (!user || !mounted) return null
    const expenses = getExpenses()
    const categories = getCategories()
    const budgets = getBudgets()

    // Calculate current discipline score
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthExpenses = expenses.filter(e => new Date(e.expenseDate) >= startOfMonth)
    const catSpending = categories.map(cat => {
      const spent = monthExpenses.filter(e => e.categoryId === cat.id).reduce((s, e) => s + e.amount, 0)
      const budget = budgets.find(b => b.categoryId === cat.id)?.monthlyLimit || 0
      return { category: cat, spent, budget, percentage: budget > 0 ? (spent / budget) * 100 : 0 }
    })
    const uniqueDays = new Set(monthExpenses.map(e => new Date(e.expenseDate).toDateString())).size
    const subCat = catSpending.find(c => c.category.name.toLowerCase().includes("subscription"))
    const savedTotal = 0
    const scoreData = calculateDisciplineScore({
      categorySpending: catSpending,
      hasSubscriptions: !!subCat,
      subscriptionCount: subCat ? monthExpenses.filter(e => e.categoryId === subCat.category.id).length : 0,
      savingsContribution: savedTotal,
      totalExpenseCount: monthExpenses.length,
      daysTracked: uniqueDays,
    })

    return generateWeeklyReport(expenses, categories, budgets, user.monthlyIncome, user.roastLevel, scoreData.score)
  }, [user, mounted])

  if (!mounted || !user || !report) {
    return <div className="space-y-5">{[1,2,3].map(i => <div key={i} className="h-36 bg-[var(--color-secondary)] rounded-2xl animate-pulse" />)}</div>
  }



  return (
    <motion.div className="space-y-6" initial="hidden" animate="visible" variants={stagger}>
      {/* Header */}
      <motion.div variants={fadeUp}>
        <p className="text-xs font-bold text-blue-400 uppercase tracking-[0.2em] mb-1">Weekly Reality Report</p>
        <h1 className="text-2xl sm:text-[1.75rem] font-bold tracking-tight">{report.headline}</h1>
        <p className="text-[var(--color-muted-foreground)] text-xs mt-1 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" /> {report.weekLabel}
        </p>
      </motion.div>

      {/* Grade + Key Stats */}
      <div className="grid lg:grid-cols-5 gap-5">
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <div className="glass-card p-6 rounded-2xl h-full flex flex-col items-center justify-center">
            <p className="text-[11px] text-[var(--color-muted-foreground)] uppercase tracking-[0.2em] font-semibold mb-4">Week Grade</p>
            <GradeRing grade={report.grade} label={report.gradeLabel} />
            <div className="flex items-center gap-2 mt-4">
              {report.scoreChange > 0 ? (
                <span className="flex items-center gap-1 text-[12px] text-emerald-400 font-semibold">
                  <ArrowUpRight className="w-3.5 h-3.5" /> +{report.scoreChange} pts
                </span>
              ) : report.scoreChange < 0 ? (
                <span className="flex items-center gap-1 text-[12px] text-red-400 font-semibold">
                  <ArrowDownRight className="w-3.5 h-3.5" /> {report.scoreChange} pts
                </span>
              ) : (
                <span className="text-[12px] text-[var(--color-muted-foreground)]">No change</span>
              )}
              <span className="text-[10px] text-[var(--color-muted-foreground)]">vs last week</span>
            </div>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="lg:col-span-3 grid sm:grid-cols-2 gap-4">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] text-[var(--color-muted-foreground)] uppercase tracking-[0.15em] font-semibold">Total Spent</p>
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <DollarSign className="w-3.5 h-3.5 text-blue-400" />
              </div>
            </div>
            <p className="text-xl font-black tracking-tight">{formatCurrency(report.totalSpent, user.currency)}</p>
            <p className="text-[11px] text-[var(--color-muted-foreground)] mt-1">{report.transactionCount} transactions · {report.daysTracked} days</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] text-[var(--color-muted-foreground)] uppercase tracking-[0.15em] font-semibold">Money Wasted</p>
              <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center">
                <TrendingDown className="w-3.5 h-3.5 text-red-400" />
              </div>
            </div>
            <p className="text-xl font-black text-red-400 tracking-tight">{formatCurrency(report.estimatedWasted, user.currency)}</p>
            <p className="text-[11px] text-[var(--color-muted-foreground)] mt-1">over-budget spending</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] text-[var(--color-muted-foreground)] uppercase tracking-[0.15em] font-semibold">Could Have Saved</p>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>
            <p className="text-xl font-black text-emerald-400 tracking-tight">{formatCurrency(report.couldHaveSaved, user.currency)}</p>
            <p className="text-[11px] text-[var(--color-muted-foreground)] mt-1">with better discipline</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] text-[var(--color-muted-foreground)] uppercase tracking-[0.15em] font-semibold">Daily Average</p>
              <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <BarChart3 className="w-3.5 h-3.5 text-orange-400" />
              </div>
            </div>
            <p className="text-xl font-black tracking-tight">{formatCurrency(report.dailyAverage, user.currency)}</p>
            <p className="text-[11px] text-[var(--color-muted-foreground)] mt-1">per active day</p>
          </div>
        </motion.div>
      </div>

      {/* Biggest Waste */}
      {report.biggestWasteCategory && (
        <motion.div variants={fadeUp}>
          <div className="glass-card rounded-2xl p-5 sm:p-6 severity-danger">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-2xl shrink-0">
                {report.biggestWasteCategory.icon}
              </div>
              <div className="flex-1">
                <p className="text-[11px] text-red-400 uppercase tracking-[0.15em] font-bold mb-1">Biggest Waste This Week</p>
                <p className="font-bold text-[15px]">{report.biggestWasteCategory.name}</p>
                <p className="text-[12px] text-[var(--color-muted-foreground)] mt-0.5">
                  Spent {formatCurrency(report.biggestWasteCategory.spent, user.currency)} — over by{" "}
                  <span className="text-red-400 font-semibold">{formatCurrency(report.biggestWasteCategory.overBy, user.currency)}</span>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Key Insights */}
      {report.topInsights.length > 0 && (
        <motion.div variants={fadeUp}>
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <h2 className="font-bold text-[15px]">Key Insights</h2>
            </div>
            <div className="space-y-3">
              {report.topInsights.map((insight, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                  className="p-4 rounded-xl bg-[var(--color-secondary)]/50 hover:bg-[var(--color-secondary)] transition-colors border-l-2 border-amber-500/30"
                >
                  <p className="text-[13px] text-[var(--color-foreground)]/80 leading-relaxed">{insight}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Spending Breakdown */}
      {report.topCategories.length > 0 && (
        <motion.div variants={fadeUp}>
          <div className="glass-card p-6 rounded-2xl">
            <h2 className="font-bold text-[15px] mb-5">Where Your Money Went</h2>
            <div className="space-y-3">
              {report.topCategories.map((cat, i) => (
                <div key={cat.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{cat.icon}</span>
                      <span className="text-[13px] font-medium">{cat.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[13px] font-semibold">{formatCurrency(cat.spent, user.currency)}</span>
                      <span className="text-[11px] text-[var(--color-muted-foreground)] ml-2">{cat.pct.toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="h-[5px] bg-[var(--color-secondary)] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-orange-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.pct}%` }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 + i * 0.06 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Verdict + Fix Next Week */}
      <motion.div variants={fadeUp}>
        <div className={`glass-card p-6 rounded-2xl ${report.grade === "A" || report.grade === "B" ? "severity-positive" : "severity-warning"}`}>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Flame className="w-4 h-4 text-orange-400" />
            </div>
            <h2 className="font-bold text-[15px]">The Verdict</h2>
          </div>
          <p className="text-[15px] text-[var(--color-foreground)]/80 leading-relaxed mb-5">{report.verdict}</p>
          <Link href="/budgets" className="inline-flex items-center gap-2 btn-primary px-6 py-3 rounded-xl text-[13px] font-semibold hover:-translate-y-0.5 transition-transform">
            <Target className="w-4 h-4" /> Fix Next Week
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </motion.div>
  )
}
