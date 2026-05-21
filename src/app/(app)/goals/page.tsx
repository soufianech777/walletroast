"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Target, Plus, X, DollarSign, Calendar, Trash2, TrendingUp, AlertTriangle, Lightbulb, Sparkles } from "lucide-react"
import { getUser, getGoals, addGoal, updateGoal, deleteGoal, getCurrentMonthExpenses, getBudgets, getCategories } from "@/lib/store"
import { formatCurrency } from "@/lib/utils"
import type { Goal } from "@/lib/types"

interface GoalPreset {
  id: string
  name: string
  emoji: string
  target: string
  style: "soft" | "co-pilot" | "brutal"
  difficulty: "easy" | "normal" | "hard"
  desc: string
  color: string
}

const PRESETS: GoalPreset[] = [
  { id: "f_you", name: "F-You Money", emoji: "🛡️", target: "10000", style: "brutal", difficulty: "hard", desc: "Quit a toxic situation with zero fear.", color: "from-red-500/20 to-orange-500/20 border-red-500/20 hover:border-red-500/40 text-red-400" },
  { id: "anti_roast", name: "Anti-Roast Shield", emoji: "🛡️", target: "300", style: "soft", difficulty: "easy", desc: "Dining out buffer to silence roasts.", color: "from-sky-500/20 to-indigo-500/20 border-sky-500/20 hover:border-sky-500/40 text-sky-400" },
  { id: "guilt_free", name: "Guilt-Free Splurge", emoji: "✈️", target: "2000", style: "co-pilot", difficulty: "normal", desc: "Pre-approved vacation or treat.", color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400" },
  { id: "debt_obliterator", name: "Debt Obliterator", emoji: "🔨", target: "5000", style: "brutal", difficulty: "hard", desc: "Crush high-interest credit card debt.", color: "from-purple-500/20 to-pink-500/20 border-purple-500/20 hover:border-purple-500/40 text-purple-400" },
  { id: "escape_velocity", name: "Escape Velocity", emoji: "🚀", target: "4000", style: "co-pilot", difficulty: "normal", desc: "Move to a new place or city.", color: "from-amber-500/20 to-yellow-500/20 border-amber-500/20 hover:border-amber-500/40 text-amber-400" },
  { id: "crisis", name: "Dream Purchase", emoji: "🏎️", target: "15000", style: "brutal", difficulty: "hard", desc: "Dream car, watch, or experience.", color: "from-rose-500/20 to-purple-500/20 border-rose-500/20 hover:border-rose-500/40 text-rose-400" },
]

function parseGoalTitle(rawTitle: string) {
  if (rawTitle.startsWith("{")) {
    try {
      const meta = JSON.parse(rawTitle)
      return {
        title: meta.name || rawTitle,
        emoji: meta.icon || "🎯",
        difficulty: meta.difficulty || "normal",
        style: meta.style || "co-pilot",
      }
    } catch {
      // fallback
    }
  }
  return {
    title: rawTitle,
    emoji: "🎯",
    difficulty: "normal",
    style: "co-pilot",
  }
}

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } } }

export default function GoalsPage() {
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null)
  const [goals, setGoals] = useState<Goal[]>([])
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState("")
  const [targetAmount, setTargetAmount] = useState("")
  const [deadline, setDeadline] = useState("")
  const [emoji, setEmoji] = useState("🎯")
  const [difficulty, setDifficulty] = useState<"easy" | "normal" | "hard">("normal")
  const [style, setStyle] = useState<"soft" | "co-pilot" | "brutal">("co-pilot")
  const [selectedPresetId, setSelectedPresetId] = useState("")
  const [addAmountGoalId, setAddAmountGoalId] = useState<string | null>(null)
  const [addAmount, setAddAmount] = useState("")
  const [mounted, setMounted] = useState(false)
  const [aiAdvice, setAiAdvice] = useState<Record<string, string>>({})

  useEffect(() => { setUser(getUser()); setGoals(getGoals()); setMounted(true) }, [])
  const refresh = () => setGoals(getGoals())

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    const serializedTitle = JSON.stringify({ name: title, icon: emoji, difficulty, style })
    addGoal({ title: serializedTitle, targetAmount: Number(targetAmount), savedAmount: 0, deadline: new Date(deadline).toISOString() })
    setTitle(""); setTargetAmount(""); setDeadline(""); setEmoji("🎯"); setDifficulty("normal"); setStyle("co-pilot"); setSelectedPresetId(""); setShowForm(false); refresh()
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
              className="fixed inset-x-4 top-[5%] sm:top-[10%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-xl z-50">
              <div className="glass-card p-6 rounded-2xl border border-[var(--color-border)] max-h-[90vh] overflow-y-auto scrollbar-thin">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-orange-400" />
                    <h2 className="text-base font-bold">Create Gamified Goal</h2>
                  </div>
                  <button onClick={() => setShowForm(false)} className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"><X className="w-5 h-5" /></button>
                </div>

                {/* Preset Scrolling Section */}
                <div className="mb-5">
                  <label className="block text-[11px] text-[var(--color-muted-foreground)] mb-2 font-bold uppercase tracking-wider">Select Exclusive Preset</label>
                  <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-orange-500/20">
                    {PRESETS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSelectedPresetId(p.id)
                          setTitle(p.name)
                          setEmoji(p.emoji)
                          setTargetAmount(p.target)
                          setDifficulty(p.difficulty)
                          setStyle(p.style)
                        }}
                        className={`flex-shrink-0 w-[150px] p-3 rounded-xl border text-left bg-gradient-to-br transition-all duration-200 hover:-translate-y-0.5 ${p.color} ${
                          selectedPresetId === p.id
                            ? "border-orange-500 ring-2 ring-orange-500/20 shadow-lg shadow-orange-500/5"
                            : "border-[var(--color-border)]"
                        }`}
                      >
                        <div className="text-xl mb-1">{p.emoji}</div>
                        <div className="text-[12px] font-bold truncate">{p.name}</div>
                        <div className="text-[9px] text-[var(--color-muted-foreground)] mt-0.5 line-clamp-2 leading-tight h-6">{p.desc}</div>
                        <div className="text-[9px] font-semibold mt-2 opacity-80 flex items-center justify-between">
                          <span>Target:</span>
                          <span>${Number(p.target).toLocaleString()}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="grid grid-cols-4 gap-3">
                    <div className="col-span-1">
                      <label className="block text-[11px] text-[var(--color-muted-foreground)] mb-1.5 font-medium">Icon</label>
                      <select
                        value={emoji}
                        onChange={(e) => {
                          setEmoji(e.target.value)
                          setSelectedPresetId("")
                        }}
                        className="w-full input-premium py-2.5 text-center text-lg cursor-pointer"
                      >
                        {["🎯", "🛡️", "💸", "✈️", "🔨", "🚀", "🏎️", "🏠", "💻", "🎓", "🍕", "✨"].map(em => (
                          <option key={em} value={em}>{em}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-3">
                      <label className="block text-[11px] text-[var(--color-muted-foreground)] mb-1.5 font-medium">Goal Title</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => {
                          setTitle(e.target.value.slice(0, 40)) // limit to 40 chars
                          setSelectedPresetId("")
                        }}
                        placeholder="e.g. Emergency Fund"
                        className="w-full input-premium"
                        maxLength={40}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-[var(--color-muted-foreground)] mb-1.5 font-medium">Target Amount</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)]" />
                        <input
                          type="number"
                          value={targetAmount}
                          onChange={(e) => {
                            setTargetAmount(e.target.value)
                            setSelectedPresetId("")
                          }}
                          placeholder="5000"
                          className="w-full pl-9 pr-4 input-premium"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] text-[var(--color-muted-foreground)] mb-1.5 font-medium">Deadline</label>
                      <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full input-premium" required />
                    </div>
                  </div>

                  {/* Challenge settings */}
                  <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-[var(--color-border)]">
                    <div>
                      <label className="block text-[11px] text-[var(--color-muted-foreground)] mb-2 font-bold uppercase tracking-wider">Challenge Difficulty</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: "easy", label: "Easy", desc: "Casual" },
                          { value: "normal", label: "Normal", desc: "Strict" },
                          { value: "hard", label: "Hardcore", desc: "Savage" }
                        ].map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              setDifficulty(opt.value as "easy" | "normal" | "hard")
                              setSelectedPresetId("")
                            }}
                            className={`p-2 rounded-xl border text-center transition-all duration-200 flex flex-col justify-center items-center ${
                              difficulty === opt.value
                                ? "border-orange-500 bg-orange-500/10 text-orange-400 shadow-sm"
                                : "border-[var(--color-border)] hover:border-[var(--color-border-hover)] bg-[var(--color-secondary)]"
                            }`}
                          >
                            <span className="text-[12px] font-bold">{opt.label}</span>
                            <span className="text-[9px] text-[var(--color-muted-foreground)] mt-0.5 leading-tight">{opt.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-[var(--color-muted-foreground)] mb-2 font-bold uppercase tracking-wider">AI Coaching Tone</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: "soft", label: "Soft", emoji: "😊" },
                          { value: "co-pilot", label: "Co-Pilot", emoji: "🤖" },
                          { value: "brutal", label: "Brutal", emoji: "🔥" }
                        ].map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              setStyle(opt.value as "soft" | "co-pilot" | "brutal")
                              setSelectedPresetId("")
                            }}
                            className={`p-2 rounded-xl border text-center transition-all duration-200 flex flex-col justify-center items-center ${
                              style === opt.value
                                ? "border-orange-500 bg-orange-500/10 text-orange-400 shadow-sm"
                                : "border-[var(--color-border)] hover:border-[var(--color-border-hover)] bg-[var(--color-secondary)]"
                            }`}
                          >
                            <span className="text-base mb-0.5">{opt.emoji}</span>
                            <span className="text-[12px] font-bold">{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="w-full py-3 btn-primary rounded-xl text-[13px] font-semibold mt-2 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/35 transition-all">
                    Create Goal
                  </button>
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

            const meta = parseGoalTitle(goal.title)

            return (
              <motion.div key={goal.id} variants={fadeUp}>
                <div className="glass-card p-6 rounded-2xl h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/10 flex items-center justify-center text-2xl shrink-0 mt-0.5">
                          {meta.emoji}
                        </div>
                        <div>
                          <h3 className="font-bold text-[15px] leading-tight text-white">{meta.title}</h3>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                              meta.difficulty === "hard" ? "bg-red-500/10 border-red-500/20 text-red-400 font-bold" :
                              meta.difficulty === "easy" ? "bg-sky-500/10 border-sky-500/20 text-sky-400" :
                              "bg-amber-500/10 border-amber-500/20 text-amber-400"
                            }`}>
                              {meta.difficulty === "hard" ? "💀 Hardcore" : meta.difficulty === "easy" ? "🛡️ Easy" : "⚡ Strict"}
                            </span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                              meta.style === "brutal" ? "bg-red-600/10 border-red-600/20 text-red-400 font-bold" :
                              meta.style === "soft" ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" :
                              "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            }`}>
                              {meta.style} AI coach
                            </span>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => { deleteGoal(goal.id); refresh() }} className="text-[var(--color-muted-foreground)] hover:text-red-400 transition-colors p-1 font-bold">
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
                      <span className="text-[var(--color-muted-foreground)] flex items-center gap-1 font-medium">
                        <Calendar className="w-3 h-3" /> {daysLeft > 0 ? `${daysLeft} days left` : "Deadline passed"}
                      </span>
                    </div>

                    {isBehind && overSpentCats.length > 0 && (
                      <div className="p-3 bg-amber-500/5 border border-amber-500/15 rounded-xl mb-3">
                        <p className="text-[11px] text-amber-400 flex items-center gap-1.5 font-medium animate-pulse">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          Behind schedule — overspending in {overSpentCats.map(c => c.name).join(", ")}
                        </p>
                      </div>
                    )}

                    {/* Smart Tip (auto-loaded) */}
                    {aiAdvice[goal.id] && (
                      <div className="p-3 bg-orange-500/5 border border-orange-500/15 rounded-xl mb-3">
                        <p className="text-[10px] text-orange-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                          <Lightbulb className="w-3 h-3 animate-pulse" /> Smart Tip
                        </p>
                        <p className="text-[12px] text-[var(--color-muted-foreground)] leading-relaxed">{aiAdvice[goal.id]}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-3">
                    {pct >= 100 ? (
                      <div className="text-center py-2.5 bg-emerald-500/5 border border-emerald-500/15 rounded-xl">
                        <p className="text-[13px] text-emerald-400 font-bold animate-bounce">🎉 Goal Achieved!</p>
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
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
