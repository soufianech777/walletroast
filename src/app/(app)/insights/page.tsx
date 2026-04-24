"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import {
  Flame, AlertTriangle, TrendingUp, TrendingDown, Lightbulb,
  Zap, Calendar
} from "lucide-react"
import { getUser, getCurrentMonthExpenses, getBudgets, getCategories, getGoals } from "@/lib/store"
import { generateInsights, getBiggestWaste, getEasiestFix } from "@/lib/engines/insight-engine"
import { formatCurrency } from "@/lib/utils"
import type { CategorySpending } from "@/lib/types"
import { calculateDisciplineScore } from "@/lib/engines/discipline-score"
import { getMonthDays } from "@/lib/utils"

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } } }

export default function InsightsPage() {
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null)
  const [mounted, setMounted] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null)

  useEffect(() => {
    const u = getUser()
     
    if (u) setUser(u)
    setMounted(true)
  }, [])

  const data = useMemo(() => {
    if (!user || !mounted) return null
    const expenses = getCurrentMonthExpenses()
    const categories = getCategories()
    const budgets = getBudgets()
    const goals = getGoals()
    const totalSpent = expenses.reduce((s, e) => s + e.amount, 0)
    const savedTotal = goals.reduce((s, g) => s + g.savedAmount, 0)

    const catSpending: CategorySpending[] = categories.map(cat => {
      const spent = expenses.filter(e => e.categoryId === cat.id).reduce((s, e) => s + e.amount, 0)
      const budget = budgets.find(b => b.categoryId === cat.id)?.monthlyLimit || 0
      return { category: cat, spent, budget, percentage: budget > 0 ? (spent / budget) * 100 : 0 }
    }).filter(c => c.spent > 0 || c.budget > 0).sort((a, b) => b.spent - a.spent)

    const insights = generateInsights(user.roastLevel, totalSpent, user.monthlyIncome, catSpending, savedTotal, expenses)
    const biggestWaste = getBiggestWaste(catSpending)
    const easiestFix = getEasiestFix(catSpending, user.roastLevel)

    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7)
    const weekExpenses = expenses.filter(e => new Date(e.expenseDate) >= weekAgo)
    const weekTotal = weekExpenses.reduce((s, e) => s + e.amount, 0)

    return { insights, biggestWaste, easiestFix, catSpending, weekTotal, weekExpenses, totalSpent }
  }, [user, mounted])

  // Silently fetch AI insights in background
  useEffect(() => {
    if (!data || !user) return
    ;(async () => {
      try {
        const { remaining: daysLeft } = getMonthDays()
        const catData = data.catSpending.map(c => ({ name: c.category.name, spent: c.spent, budget: c.budget }))
        const score = calculateDisciplineScore({
          categorySpending: data.catSpending,
          hasSubscriptions: false,
          subscriptionCount: 0,
          savingsContribution: 0,
          totalExpenseCount: data.catSpending.length,
          daysTracked: new Date().getDate()
        })
        const res = await fetch("/api/ai/insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            monthlyIncome: user.monthlyIncome,
            totalSpent: data.totalSpent,
            categories: catData,
            disciplineScore: score.score,
            roastLevel: user.roastLevel,
            topCategory: catData[0]?.name || "Unknown",
            daysLeft,
          }),
        })
        const result = await res.json()
        if (result.insights) setAiAnalysis(result.insights)
      } catch (err) {
        console.error("AI insights failed silently:", err)
      }
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data !== null])

  if (!mounted || !user || !data) {
    return <div className="space-y-5">{[1,2,3].map(i => <div key={i} className="h-40 bg-[var(--color-secondary)] rounded-2xl animate-pulse" />)}</div>
  }

  const roastEmoji = user.roastLevel === "soft" ? "😊" : user.roastLevel === "direct" ? "😐" : "🔥"

  return (
    <motion.div className="space-y-6" initial="hidden" animate="visible" variants={stagger}>
      <motion.div variants={fadeUp}>
        <p className="text-xs font-bold text-orange-400 uppercase tracking-[0.2em] mb-1">Insights</p>
        <h1 className="text-2xl sm:text-[1.75rem] font-bold tracking-tight">The Truth About Your Money</h1>
        <p className="text-[var(--color-muted-foreground)] text-xs mt-1">{roastEmoji} {user.roastLevel.charAt(0).toUpperCase() + user.roastLevel.slice(1)} mode active</p>
      </motion.div>

      {/* Today's Truth */}
      <motion.div variants={fadeUp}>
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Flame className="w-4 h-4 text-orange-400" />
            </div>
            <h2 className="font-bold text-[15px]">Today&apos;s Truth</h2>
          </div>
          {data.insights.length > 0 ? (
            <div className="space-y-3">
              {data.insights.map((insight, i) => (
                <motion.div key={insight.id}
                  initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className={`p-4 rounded-xl severity-${insight.severity} bg-[var(--color-secondary)]/50 hover:bg-[var(--color-secondary)] transition-colors`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    {insight.severity === "danger" && <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />}
                    {insight.severity === "warning" && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
                    {insight.severity === "positive" && <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />}
                    {insight.severity === "info" && <Lightbulb className="w-4 h-4 text-blue-400 shrink-0" />}
                    <span className="font-bold text-[13px]">{insight.title}</span>
                  </div>
                  <p className="text-[13px] text-[var(--color-muted-foreground)] leading-relaxed ml-6">{insight.message}</p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-[var(--color-muted-foreground)] text-sm">No insights yet — add expenses to get roasted!</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* ─── Smart Analysis (auto-loaded) ─── */}
      {aiAnalysis && (
        <motion.div variants={fadeUp}>
          <div className="glass-card p-6 rounded-2xl border border-orange-500/10">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Zap className="w-4 h-4 text-orange-400" />
              </div>
              <h2 className="font-bold text-[15px]">Smart Analysis</h2>
            </div>
            <div className="space-y-2">
              {aiAnalysis.split("\n").filter(Boolean).map((line, i) => (
                <p key={i} className="text-[13px] text-[var(--color-muted-foreground)] leading-relaxed">
                  {line}
                </p>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid sm:grid-cols-2 gap-5">
        {/* Biggest Waste */}
        <motion.div variants={fadeUp}>
          <div className="glass-card p-6 rounded-2xl h-full severity-danger">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-red-400" />
              </div>
              <h2 className="font-bold text-[15px]">Biggest Waste</h2>
            </div>
            {data.biggestWaste ? (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: data.biggestWaste.category.color + "15" }}>
                    {data.biggestWaste.category.icon}
                  </div>
                  <div>
                    <p className="font-bold text-[15px]">{data.biggestWaste.category.name}</p>
                    <p className="text-[12px] text-[var(--color-muted-foreground)]">Over by {formatCurrency(data.biggestWaste.spent - data.biggestWaste.budget, user.currency)}</p>
                  </div>
                </div>
                <div className="h-[6px] bg-[var(--color-secondary)] rounded-full overflow-hidden">
                  <motion.div className="h-full bg-red-500 rounded-full"
                    initial={{ width: 0 }} animate={{ width: `${Math.min(data.biggestWaste.percentage, 100)}%` }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} />
                </div>
                <p className="text-[11px] text-[var(--color-muted-foreground)] mt-2">{data.biggestWaste.percentage.toFixed(0)}% of budget used</p>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-emerald-400 font-medium text-sm">✨ No waste detected!</p>
                <p className="text-[var(--color-muted-foreground)] text-xs mt-1">All categories within budget.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Easiest Fix */}
        <motion.div variants={fadeUp}>
          <div className="glass-card p-6 rounded-2xl h-full severity-info">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Zap className="w-4 h-4 text-blue-400" />
              </div>
              <h2 className="font-bold text-[15px]">Easiest Fix</h2>
            </div>
            <p className="text-[15px] text-[var(--color-foreground)]/80 leading-relaxed">{data.easiestFix}</p>
          </div>
        </motion.div>
      </div>

      {/* Weekly Roast */}
      <motion.div variants={fadeUp}>
        <div className="glass-card p-6 rounded-2xl severity-warning">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-amber-400" />
            </div>
            <h2 className="font-bold text-[15px]">Weekly Roast</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="stat-card text-center">
              <p className="text-[11px] text-[var(--color-muted-foreground)] uppercase tracking-[0.15em] font-semibold mb-1">This Week</p>
              <p className="text-xl font-bold">{formatCurrency(data.weekTotal, user.currency)}</p>
            </div>
            <div className="stat-card text-center">
              <p className="text-[11px] text-[var(--color-muted-foreground)] uppercase tracking-[0.15em] font-semibold mb-1">Transactions</p>
              <p className="text-xl font-bold">{data.weekExpenses.length}</p>
            </div>
          </div>
          <p className="text-[13px] text-[var(--color-foreground)]/80 leading-relaxed">
            {data.weekTotal > user.monthlyIncome * 0.25
              ? user.roastLevel === "brutal"
                ? `${formatCurrency(data.weekTotal, user.currency)} in one week? That's ${((data.weekTotal / user.monthlyIncome) * 100).toFixed(0)}% of your income. At this rate, you won't survive the month.`
                : user.roastLevel === "direct"
                ? `You spent ${formatCurrency(data.weekTotal, user.currency)} this week — ${((data.weekTotal / user.monthlyIncome) * 100).toFixed(0)}% of your income. Slow down.`
                : `This week you spent ${formatCurrency(data.weekTotal, user.currency)}. That's a bit high — consider being more mindful.`
              : user.roastLevel === "brutal" ? "Decent week. Don't let it go to your head." : "Good week! Keep this energy going."
            }
          </p>
        </div>
      </motion.div>

      {/* Spending Heatmap */}
      <motion.div variants={fadeUp}>
        <div className="glass-card p-6 rounded-2xl">
          <h2 className="font-bold text-[15px] mb-5">Spending Heatmap</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {data.catSpending.map(cat => {
              const intensity = Math.min(cat.percentage / 100, 1.5)
              const r = Math.round(34 + intensity * 200)
              const g = Math.round(197 - intensity * 150)
              const b = Math.round(94 - intensity * 50)
              return (
                <motion.div key={cat.category.id}
                  whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}
                  className="p-3 rounded-xl border text-center cursor-default"
                  style={{ backgroundColor: `rgba(${r}, ${Math.max(g, 40)}, ${Math.max(b, 40)}, 0.12)`, borderColor: `rgba(${r}, ${Math.max(g, 40)}, ${Math.max(b, 40)}, 0.25)` }}>
                  <div className="text-xl mb-1">{cat.category.icon}</div>
                  <p className="text-[11px] font-semibold truncate">{cat.category.name}</p>
                  <p className="text-[10px] text-[var(--color-muted-foreground)] mt-0.5">{cat.percentage.toFixed(0)}%</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
