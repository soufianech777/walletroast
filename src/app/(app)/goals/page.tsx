"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Target, Plus, X, DollarSign, Calendar, Trash2, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react"
import { getUser, getGoals, addGoal, updateGoal, deleteGoal, getCurrentMonthExpenses, getBudgets, getCategories } from "@/lib/store"
import { formatCurrency } from "@/lib/utils"
import type { Goal } from "@/lib/types"

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } } }

export default function GoalsPage() {
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null)
  const [goals, setGoals] = useState<Goal[]>([])
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState("")
  const [targetAmount, setTargetAmount] = useState("")
  const [deadline, setDeadline] = useState("")
  const [addAmountGoalId, setAddAmountGoalId] = useState<string | null>(null)
  const [addAmount, setAddAmount] = useState("")
  const [mounted, setMounted] = useState(false)
  const [aiAdvice, setAiAdvice] = useState<Record<string, string>>({})

  useEffect(() => { setUser(getUser()); setGoals(getGoals()); setMounted(true) }, [])
  const refresh = () => setGoals(getGoals())

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    addGoal({ title, targetAmount: Number(targetAmount), savedAmount: 0, deadline: new Date(deadline).toISOString() })
    setTitle(""); setTargetAmount(""); setDeadline(""); setShowForm(false); refresh()
  }

  const handleAddSavings = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId)
    if (goal) { updateGoal(goalId, { savedAmount: goal.savedAmount + Number(addAmount) }); setAddAmountGoalId(null); setAddAmount(""); refresh() }
  }

  // Silently fetch AI advice for all goals on mount
  useEffect(() => {
    if (!user || goals.length === 0) return
    const totalSpent = getCurrentMonthExpenses().reduce((s, e) => s + e.amount, 0)
    goals.forEach(async (goal) => {
      if (aiAdvice[goal.id]) return // already have advice
      try {
        const deadlineDate = new Date(goal.deadline)
        const dLeft = Math.max(0, Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        const res = await fetch("/api/ai/goals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: goal.title,
            targetAmount: goal.targetAmount,
            savedAmount: goal.savedAmount,
            deadline: goal.deadline,
            daysLeft: dLeft,
            monthlyIncome: user?.monthlyIncome || 4000,
            totalSpent,
          }),
        })
        const data = await res.json()
        if (data.advice) {
          setAiAdvice(prev => ({ ...prev, [goal.id]: data.advice }))
        }
      } catch (err) {
        console.error("AI goal advice failed silently:", err)
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goals.length, user !== null])

  if (!mounted) return <div className="animate-pulse"><div className="h-96 bg-[var(--color-secondary)] rounded-2xl" /></div>

  const expenses = getCurrentMonthExpenses()
  const categories = getCategories()
  const budgets = getBudgets()
  const overSpentCats = categories.filter(cat => {
    const spent = expenses.filter(e => e.categoryId === cat.id).reduce((s, e) => s + e.amount, 0)
    const budget = budgets.find(b => b.categoryId === cat.id)?.monthlyLimit || 0
    return spent > budget && budget > 0
  })

  return (
    <motion.div className="space-y-6" initial="hidden" animate="visible" variants={stagger}>
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-orange-400 uppercase tracking-[0.2em] mb-1">Goals</p>
          <h1 className="text-2xl sm:text-[1.75rem] font-bold tracking-tight">Track Your Targets</h1>
          <p className="text-[var(--color-muted-foreground)] text-xs mt-1">Save with purpose</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary px-5 py-2.5 rounded-xl text-[13px] font-semibold flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Goal
        </button>
      </motion.div>

      {/* Create Goal Modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setShowForm(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-x-4 top-[15%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-md z-50">
              <div className="glass-card p-6 rounded-2xl border border-[var(--color-border)]">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-base font-bold">Create Goal</h2>
                  <button onClick={() => setShowForm(false)} className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="block text-[12px] text-[var(--color-muted-foreground)] mb-1.5 font-medium">Goal Title</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Emergency Fund" className="w-full input-premium" required />
                  </div>
                  <div>
                    <label className="block text-[12px] text-[var(--color-muted-foreground)] mb-1.5 font-medium">Target Amount</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)]" />
                      <input type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} placeholder="5000" className="w-full pl-10 pr-4 input-premium" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[12px] text-[var(--color-muted-foreground)] mb-1.5 font-medium">Deadline</label>
                    <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full input-premium" required />
                  </div>
                  <button type="submit" className="w-full py-2.5 btn-primary rounded-xl text-[13px] font-semibold">Create Goal</button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Goal Cards */}
      {goals.length === 0 ? (
        <motion.div variants={fadeUp} className="glass-card p-14 rounded-2xl text-center">
          <Target className="w-10 h-10 text-[var(--color-muted-foreground)] mx-auto mb-4 opacity-40" />
          <p className="text-[var(--color-muted-foreground)] text-base mb-1">No goals yet</p>
          <p className="text-[var(--color-muted-foreground)] text-xs opacity-60">Create your first savings goal</p>
        </motion.div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {goals.map((goal, i) => {
            const pct = goal.targetAmount > 0 ? (goal.savedAmount / goal.targetAmount) * 100 : 0
            const remaining = goal.targetAmount - goal.savedAmount
            const deadlineDate = new Date(goal.deadline)
             
            const daysLeft = Math.max(0, Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
            const isBehind = daysLeft > 0 && remaining > 0 && (remaining / daysLeft) > (goal.targetAmount / 90)

            return (
              <motion.div key={goal.id} variants={fadeUp}>
                <div className="glass-card p-6 rounded-2xl h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-[15px]">{goal.title}</h3>
                      <p className="text-[11px] text-[var(--color-muted-foreground)] flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" /> {daysLeft > 0 ? `${daysLeft} days left` : "Deadline passed"}
                      </p>
                    </div>
                    <button onClick={() => { deleteGoal(goal.id); refresh() }} className="text-[var(--color-muted-foreground)] hover:text-red-400 transition-colors p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-2xl font-bold tracking-tight">{formatCurrency(goal.savedAmount, user?.currency)}</span>
                    <span className="text-[var(--color-muted-foreground)] text-xs">/ {formatCurrency(goal.targetAmount, user?.currency)}</span>
                  </div>

                  <div className="h-2.5 bg-[var(--color-secondary)] rounded-full overflow-hidden mb-3">
                    <motion.div
                      className={`h-full rounded-full ${pct >= 100 ? "bg-emerald-500" : pct > 50 ? "bg-blue-500" : "bg-orange-500"}`}
                      initial={{ width: 0 }} animate={{ width: `${Math.min(pct, 100)}%` }}
                      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 + i * 0.05 }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] mb-4">
                    <span className="text-[var(--color-muted-foreground)]">{pct.toFixed(0)}% complete</span>
                    <span className="text-[var(--color-muted-foreground)]">{formatCurrency(remaining > 0 ? remaining : 0, user?.currency)} to go</span>
                  </div>

                  {isBehind && overSpentCats.length > 0 && (
                    <div className="p-3 bg-amber-500/5 border border-amber-500/15 rounded-xl mb-3">
                      <p className="text-[11px] text-amber-400 flex items-center gap-1.5 font-medium">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        Behind schedule — overspending in {overSpentCats.map(c => c.name).join(", ")}
                      </p>
                    </div>
                  )}

                  {/* Smart Tip (auto-loaded) */}
                  {aiAdvice[goal.id] && (
                    <div className="p-3 bg-orange-500/5 border border-orange-500/15 rounded-xl mb-3">
                      <p className="text-[10px] text-orange-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Lightbulb className="w-3 h-3" /> Smart Tip
                      </p>
                      <p className="text-[12px] text-[var(--color-muted-foreground)] leading-relaxed">{aiAdvice[goal.id]}</p>
                    </div>
                  )}

                  {pct >= 100 ? (
                    <div className="text-center py-2.5 bg-emerald-500/5 border border-emerald-500/15 rounded-xl">
                      <p className="text-[13px] text-emerald-400 font-bold">🎉 Goal Achieved!</p>
                    </div>
                  ) : addAmountGoalId === goal.id ? (
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-muted-foreground)]" />
                        <input type="number" value={addAmount} onChange={(e) => setAddAmount(e.target.value)} placeholder="100"
                          className="w-full pl-7 pr-2 py-2 input-premium text-[13px]" autoFocus />
                      </div>
                      <button onClick={() => handleAddSavings(goal.id)} className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-[13px] font-semibold transition-all">Save</button>
                      <button onClick={() => setAddAmountGoalId(null)} className="px-3 py-2 bg-[var(--color-secondary)] hover:bg-[var(--color-border)] rounded-xl text-[13px] transition-all">✕</button>
                    </div>
                  ) : (
                    <button onClick={() => setAddAmountGoalId(goal.id)}
                      className="w-full py-2.5 bg-orange-500/5 hover:bg-orange-500/10 border border-orange-500/15 rounded-xl text-[13px] text-orange-400 font-semibold transition-all flex items-center justify-center gap-1.5 hover:-translate-y-0.5">
                      <TrendingUp className="w-4 h-4" /> Add Savings
                    </button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
