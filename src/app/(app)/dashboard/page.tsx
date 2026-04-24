"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { motion, useInView } from "framer-motion"
import {
  DollarSign, TrendingDown, AlertTriangle, Flame, ArrowRight,
  TrendingUp, Wallet, BarChart3, Zap, Plus, Sparkles, ShieldAlert, FileBarChart, Users
} from "lucide-react"
import { getUser, getCurrentMonthExpenses, getBudgets, getGoals, getCategories, getExpenses } from "@/lib/store"
import { generateInsights } from "@/lib/engines/insight-engine"
import { calculateDisciplineScore } from "@/lib/engines/discipline-score"
import { calculateProjection } from "@/lib/engines/projection-engine"
import { detectMoneyLeaks } from "@/lib/engines/leak-detector"
import { generateWeeklyReport } from "@/lib/engines/weekly-report"
import { formatCurrency, getScoreLabel, getMonthDays } from "@/lib/utils"
import type { CategorySpending } from "@/lib/types"
import Link from "next/link"

/* ─── Animated Counter ─── */
function AnimatedValue({ value, prefix = "", suffix = "", className = "" }: { value: number; prefix?: string; suffix?: string; className?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    let start = 0
    const duration = 900
    const step = (ts: number) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * value))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [isInView, value])

  return <span ref={ref} className={className}>{prefix}{count.toLocaleString()}{suffix}</span>
}

/* ─── Score Ring ─── */
function ScoreRing({ score }: { score: number }) {
  const { label, color } = getScoreLabel(score)
  const circumference = 2 * Math.PI * 52
  const offset = circumference - (score / 100) * circumference
  const strokeColor = score >= 70 ? "#10b981" : score >= 50 ? "#f59e0b" : score >= 30 ? "#f97316" : "#ef4444"

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[140px] h-[140px]">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 116 116">
          <circle cx="58" cy="58" r="52" stroke="var(--color-border)" strokeWidth="6" fill="none" />
          <motion.circle
            cx="58" cy="58" r="52" stroke={strokeColor} strokeWidth="6" fill="none"
            strokeLinecap="round" strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[2rem] font-black tracking-tight leading-none">
            <AnimatedValue value={score} />
          </span>
          <span className="text-[11px] text-[var(--color-muted-foreground)] mt-0.5">/100</span>
        </div>
      </div>
      <span className={`text-sm font-bold mt-3 ${color}`}>{label}</span>
    </div>
  )
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } }
}
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } }
}

export default function DashboardPage() {
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null)
  const [mounted, setMounted] = useState(false)
  const [aiTip, setAiTip] = useState<string | null>(null)

  useEffect(() => {
    const u = getUser()
     
    if (u) setUser(u)
    setMounted(true)
  }, [])

  // Silently fetch AI daily tip
  useEffect(() => {
    if (!user || !mounted) return
    const cacheKey = `walletroast_ai_tip_${new Date().toDateString()}`
    const cached = localStorage.getItem(cacheKey)
    if (cached) { setAiTip(cached); return }
    // Wait for data to be ready in next tick
    setTimeout(async () => {
      try {
        const expenses = getCurrentMonthExpenses()
        const categories = getCategories()
        const budgets = getBudgets()
        const totalSpent = expenses.reduce((s, e) => s + e.amount, 0)
        const catSpending = categories.map(cat => {
          const spent = expenses.filter(e => e.categoryId === cat.id).reduce((s, e) => s + e.amount, 0)
          const budget = budgets.find(b => b.categoryId === cat.id)?.monthlyLimit || 0
          return { name: cat.name, spent, budget }
        }).filter(c => c.spent > 0).sort((a, b) => b.spent - a.spent)
        const { remaining: daysLeft } = getMonthDays()
        const res = await fetch("/api/ai/roast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            monthlyIncome: user.monthlyIncome,
            totalSpent,
            categories: catSpending.slice(0, 5),
            disciplineScore: 50,
            roastLevel: user.roastLevel,
            topCategory: catSpending[0]?.name || "Food",
            daysLeft,
          }),
        })
        const result = await res.json()
        if (result.roast) {
          setAiTip(result.roast)
          localStorage.setItem(cacheKey, result.roast)
        }
      } catch (err) {
        console.error("AI tip failed silently:", err)
      }
    }, 500)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user !== null])

  const data = useMemo(() => {
    if (!user || !mounted) return null

    const expenses = getCurrentMonthExpenses()
    const categories = getCategories()
    const budgets = getBudgets()
    const goals = getGoals()
    const allExpenses = getExpenses()

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)
    const remainingBalance = user.monthlyIncome - totalSpent

    const catSpending: CategorySpending[] = categories.map(cat => {
      const spent = expenses.filter(e => e.categoryId === cat.id).reduce((s, e) => s + e.amount, 0)
      const budget = budgets.find(b => b.categoryId === cat.id)?.monthlyLimit || 0
      return { category: cat, spent, budget, percentage: budget > 0 ? (spent / budget) * 100 : 0 }
    }).filter(c => c.spent > 0 || c.budget > 0).sort((a, b) => b.spent - a.spent)

    const moneyWasted = catSpending.reduce((sum, c) => sum + Math.max(0, c.spent - c.budget), 0)
    const savedTotal = goals.reduce((s, g) => s + g.savedAmount, 0)
    const insights = generateInsights(user.roastLevel, totalSpent, user.monthlyIncome, catSpending, savedTotal, expenses)

    const subCat = catSpending.find(c => c.category.name.toLowerCase().includes("subscription"))
    const uniqueDays = new Set(expenses.map(e => new Date(e.expenseDate).toDateString())).size
    const scoreData = calculateDisciplineScore({
      categorySpending: catSpending,
      hasSubscriptions: !!subCat,
      subscriptionCount: subCat ? expenses.filter(e => e.categoryId === subCat.category.id).length : 0,
      savingsContribution: savedTotal,
      totalExpenseCount: expenses.length,
      daysTracked: uniqueDays,
    })

    const projection = calculateProjection(totalSpent, user.monthlyIncome, user.roastLevel, user.savingsGoal)
    const leakData = detectMoneyLeaks(allExpenses, categories, user.currency)
    const weeklyReport = generateWeeklyReport(allExpenses, categories, budgets, user.monthlyIncome, user.roastLevel, scoreData.score)

    return { totalSpent, remainingBalance, moneyWasted, savedTotal, catSpending, insights, scoreData, projection, expenses, leakData, weeklyReport }
  }, [user, mounted])

  if (!mounted || !user || !data) {
    return (
      <div className="space-y-5">
        <div className="h-10 w-48 bg-[var(--color-secondary)] rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-[110px] bg-[var(--color-secondary)] rounded-2xl animate-pulse" />)}
        </div>
        <div className="h-56 bg-[var(--color-secondary)] rounded-2xl animate-pulse" />
      </div>
    )
  }

  const { elapsed, total } = getMonthDays()
  const monthProgress = (elapsed / total) * 100
  const spendProgress = user.monthlyIncome > 0 ? (data.totalSpent / user.monthlyIncome) * 100 : 0

  const statCards = [
    {
      label: "Total Spent", value: data.totalSpent, prefix: "$",
      icon: DollarSign, color: "text-[var(--color-foreground)]",
      iconBg: "bg-blue-500/10", iconColor: "text-blue-400",
      detail: `${spendProgress.toFixed(0)}% of income`
    },
    {
      label: "Remaining", value: data.remainingBalance, prefix: "$",
      icon: Wallet,
      color: data.remainingBalance > 0 ? "text-emerald-400" : "text-red-400",
      iconBg: data.remainingBalance > 0 ? "bg-emerald-500/10" : "bg-red-500/10",
      iconColor: data.remainingBalance > 0 ? "text-emerald-400" : "text-red-400",
      detail: `${(100 - spendProgress).toFixed(0)}% of income`
    },
    {
      label: "Wasted", value: data.moneyWasted, prefix: "$",
      icon: TrendingDown, color: "text-red-400",
      iconBg: "bg-red-500/10", iconColor: "text-red-400",
      detail: "over-budget spending"
    },
    {
      label: "Discipline", value: data.scoreData.score, suffix: "/100",
      icon: Flame, color: getScoreLabel(data.scoreData.score).color,
      iconBg: "bg-orange-500/10", iconColor: "text-orange-400",
      detail: getScoreLabel(data.scoreData.score).label
    },
  ]

  return (
    <motion.div className="space-y-6" initial="hidden" animate="visible" variants={stagger}>
      {/* ─── Header ─── */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-orange-400 uppercase tracking-[0.2em] mb-1">
            {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
          <h1 className="text-2xl sm:text-[1.75rem] font-bold tracking-tight">
            Welcome back, {user.name?.split(" ")[0]}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1.5 text-xs text-[var(--color-muted-foreground)]">
              <span>Day {elapsed} of {total}</span>
              <span className="text-[var(--color-border)]">·</span>
              <span>{user.roastLevel === "soft" ? "😊" : user.roastLevel === "direct" ? "😐" : "🔥"} {user.roastLevel.charAt(0).toUpperCase() + user.roastLevel.slice(1)} mode</span>
            </div>
          </div>
        </div>
        <Link href="/expenses" className="btn-primary px-5 py-2.5 rounded-xl text-[13px] font-semibold flex items-center gap-2 self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Add Expense
        </Link>
      </motion.div>

      {/* ─── Month Progress Bar ─── */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center justify-between text-[11px] text-[var(--color-muted-foreground)] mb-1.5 font-medium">
          <span>{monthProgress.toFixed(0)}% of month elapsed</span>
          <span>{spendProgress.toFixed(0)}% of income spent</span>
        </div>
        <div className="h-1.5 bg-[var(--color-secondary)] rounded-full overflow-hidden flex">
          <motion.div
            className={`h-full rounded-full ${spendProgress > monthProgress + 10 ? "bg-red-500" : spendProgress > monthProgress ? "bg-amber-500" : "bg-emerald-500"}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(spendProgress, 100)}%` }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          />
        </div>
      </motion.div>

      {/* ─── Stat Cards ─── */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="stat-card group">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] text-[var(--color-muted-foreground)] uppercase tracking-[0.15em] font-semibold">{stat.label}</p>
              <div className={`w-8 h-8 rounded-lg ${stat.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`w-4 h-4 ${stat.iconColor}`} />
              </div>
            </div>
            <p className={`text-[1.5rem] font-bold tracking-tight ${stat.color} leading-none mb-1`}>
              {stat.prefix && <span className="text-base font-semibold opacity-60">{stat.prefix}</span>}
              <AnimatedValue value={Math.abs(stat.value)} />
              {stat.suffix && <span className="text-sm font-medium opacity-50 ml-0.5">{stat.suffix}</span>}
            </p>
            <p className="text-[11px] text-[var(--color-muted-foreground)]">{stat.detail}</p>
          </div>
        ))}
      </motion.div>

      {/* ─── Smart Tip (auto-loaded) ─── */}
      {aiTip && (
        <motion.div variants={fadeUp}>
          <div className="glass-card p-5 rounded-2xl border border-orange-500/10">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-orange-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[13px]">Today&apos;s Smart Tip</h3>
                <p className="mt-1 text-[13px] text-[var(--color-muted-foreground)] leading-relaxed">{aiTip}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── Insights + Score ─── */}
      <div className="grid lg:grid-cols-5 gap-5">
        {/* Insights */}
        <motion.div variants={fadeUp} className="lg:col-span-3">
          <div className="glass-card p-6 rounded-2xl h-full">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-[15px] flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Flame className="w-4 h-4 text-orange-400" />
                </div>
                Today&apos;s Roast
              </h2>
              <Link href="/insights" className="text-xs text-orange-400 hover:text-orange-300 font-medium">View all →</Link>
            </div>
            <div className="space-y-3">
              {data.insights.length > 0 ? data.insights.slice(0, 3).map((insight, i) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className={`p-4 rounded-xl severity-${insight.severity} bg-[var(--color-secondary)]/50 hover:bg-[var(--color-secondary)] transition-colors`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    {insight.severity === "danger" && <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />}
                    {insight.severity === "warning" && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
                    {insight.severity === "positive" && <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />}
                    {insight.severity === "info" && <Zap className="w-4 h-4 text-blue-400 shrink-0" />}
                    <span className="font-bold text-[13px]">{insight.title}</span>
                  </div>
                  <p className="text-[13px] text-[var(--color-muted-foreground)] leading-relaxed ml-6">{insight.message}</p>
                </motion.div>
              )) : (
                <div className="text-center py-10">
                  <Sparkles className="w-8 h-8 text-[var(--color-muted-foreground)] mx-auto mb-3 opacity-40" />
                  <p className="text-[var(--color-muted-foreground)] text-sm">No insights yet. Add expenses to get roasted.</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Score */}
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <div className="glass-card p-6 rounded-2xl h-full flex flex-col items-center justify-center">
            <p className="text-[11px] text-[var(--color-muted-foreground)] uppercase tracking-[0.2em] font-semibold mb-5">Discipline Score</p>
            <ScoreRing score={data.scoreData.score} />
            <div className="mt-5 space-y-2 w-full max-w-[200px]">
              {data.scoreData.factors.slice(0, 4).map((f, i) => (
                <div key={i} className="flex items-center justify-between text-[11px]">
                  <span className="text-[var(--color-muted-foreground)] truncate mr-2">{f.label}</span>
                  <span className={`font-bold shrink-0 ${f.impact > 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {f.impact > 0 ? "+" : ""}{f.impact}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ─── Projection ─── */}
      <motion.div variants={fadeUp}>
        <div className={`glass-card p-6 rounded-2xl ${data.projection.isPositive ? "severity-positive" : "severity-danger"}`}>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-orange-400" />
            </div>
            <h2 className="font-bold text-[15px]">End-of-Month Projection</h2>
          </div>
          <p className="text-[15px] text-[var(--color-foreground)]/80 leading-relaxed mb-2">{data.projection.message}</p>
          <div className="flex items-center gap-4 text-[12px] text-[var(--color-muted-foreground)]">
            <span>Daily avg: <strong className="text-[var(--color-foreground)]">{formatCurrency(data.projection.dailyAverage, user.currency)}</strong>/day</span>
            <span className="text-[var(--color-border)]">·</span>
            <span>Projected: <strong className={data.projection.isPositive ? "text-emerald-400" : "text-red-400"}>
              {formatCurrency(Math.abs(data.projection.projectedBalance), user.currency)}
            </strong> {data.projection.isPositive ? "surplus" : "deficit"}</span>
          </div>
        </div>
      </motion.div>

      {/* ─── Money Leak Alert ─── */}
      {data.leakData.totalMonthlyLoss > 0 && (
        <motion.div variants={fadeUp}>
          <Link href="/leaks" className="block">
            <div className="glass-card rounded-2xl p-5 sm:p-6 border-amber-500/15 hover:border-amber-500/25 transition-all duration-300 hover:-translate-y-0.5 group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/15 to-amber-500/10 flex items-center justify-center shrink-0 animate-pulse-glow group-hover:scale-105 transition-transform">
                  <ShieldAlert className="w-6 h-6 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-[14px]">Hidden Money Leaks Detected</h3>
                    <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded-md text-[10px] font-bold text-red-400">
                      {data.leakData.leakCount} found
                    </span>
                  </div>
                  <p className="text-[12px] text-[var(--color-muted-foreground)] leading-relaxed">
                    You&apos;re losing <span className="text-red-400 font-bold">{formatCurrency(data.leakData.totalMonthlyLoss, user.currency)}/month</span> on
                    small recurring expenses. That&apos;s {formatCurrency(data.leakData.totalMonthlyLoss * 12, user.currency)} per year.
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-[var(--color-muted-foreground)] group-hover:text-orange-400 group-hover:translate-x-1 transition-all shrink-0" />
              </div>
            </div>
          </Link>
        </motion.div>
      )}
      {/* ─── Weekly Report Card ─── */}
      <motion.div variants={fadeUp}>
        <Link href="/report" className="block">
          <div className="glass-card rounded-2xl p-5 sm:p-6 hover:border-blue-500/20 transition-all duration-300 hover:-translate-y-0.5 group cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/15 to-orange-500/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <FileBarChart className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-bold text-[14px]">Weekly Reality Report</h3>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                    data.weeklyReport.grade === "A" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : data.weeklyReport.grade === "B" ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                    : data.weeklyReport.grade === "C" ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    : "bg-red-500/10 border-red-500/20 text-red-400"
                  }`}>
                    Grade {data.weeklyReport.grade}
                  </span>
                </div>
                <p className="text-[12px] text-[var(--color-muted-foreground)] leading-relaxed">
                  {data.weeklyReport.headline} — Spent <span className="font-semibold text-[var(--color-foreground)]">{formatCurrency(data.weeklyReport.totalSpent, user.currency)}</span> this week.
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-[var(--color-muted-foreground)] group-hover:text-orange-400 group-hover:translate-x-1 transition-all shrink-0" />
            </div>
          </div>
        </Link>
      </motion.div>

      {/* ─── Roast Social Card ─── */}
      <motion.div variants={fadeUp}>
        <Link href="/social" className="block">
          <div className="glass-card rounded-2xl p-5 sm:p-6 hover:border-orange-500/20 transition-all duration-300 hover:-translate-y-0.5 group cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/15 to-pink-500/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Users className="w-6 h-6 text-orange-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-bold text-[14px]">Roast Social</h3>
                  <span className="px-2 py-0.5 bg-orange-500/10 border border-orange-500/20 rounded-md text-[10px] font-bold text-orange-400">
                    🔥 Live
                  </span>
                </div>
                <p className="text-[12px] text-[var(--color-muted-foreground)] leading-relaxed">
                  Share your roast, compete on leaderboards, and go viral. Join the community!
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-[var(--color-muted-foreground)] group-hover:text-orange-400 group-hover:translate-x-1 transition-all shrink-0" />
            </div>
          </div>
        </Link>
      </motion.div>
      {/* ─── Category Breakdown ─── */}
      <motion.div variants={fadeUp}>
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-[15px]">Category Breakdown</h2>
            <Link href="/budgets" className="text-xs text-orange-400 hover:text-orange-300 font-medium">Manage →</Link>
          </div>
          <div className="space-y-4">
            {data.catSpending.slice(0, 8).map((cat, i) => {
              const pct = Math.min(cat.percentage, 100)
              const isOver = cat.percentage > 100
              return (
                <motion.div
                  key={cat.category.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.06, duration: 0.4 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{cat.category.icon}</span>
                      <span className="text-[13px] font-medium">{cat.category.name}</span>
                    </div>
                    <div className="text-[13px] text-right">
                      <span className={isOver ? "text-red-400 font-bold" : "text-[var(--color-foreground)]"}>
                        {formatCurrency(cat.spent, user.currency)}
                      </span>
                      <span className="text-[var(--color-muted-foreground)] mx-1">/</span>
                      <span className="text-[var(--color-muted-foreground)]">{formatCurrency(cat.budget, user.currency)}</span>
                    </div>
                  </div>
                  <div className="h-[6px] bg-[var(--color-secondary)] rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${isOver ? "bg-red-500" : pct > 75 ? "bg-amber-500" : "bg-emerald-500"}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(pct, 100)}%` }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 + i * 0.05 }}
                    />
                  </div>
                  {isOver && (
                    <p className="text-[11px] text-red-400 mt-1 font-medium">
                      {cat.percentage.toFixed(0)}% — Over by {formatCurrency(cat.spent - cat.budget, user.currency)}
                    </p>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
