"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DollarSign, AlertTriangle, Check } from "lucide-react"
import { getUser, getCategories, getBudgets, updateBudget, getCurrentMonthExpenses } from "@/lib/store"
import { formatCurrency } from "@/lib/utils"
import type { Category, Budget } from "@/lib/types"

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } }
}

export default function BudgetsPage() {
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [expenses, setExpenses] = useState<ReturnType<typeof getCurrentMonthExpenses>>([])
  const [editingCat, setEditingCat] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const u = getUser()
     
    if (u) setUser(u)
    setCategories(getCategories())
    setBudgets(getBudgets())
    setExpenses(getCurrentMonthExpenses())
    setMounted(true)
  }, [])

  const refreshData = () => setBudgets(getBudgets())

  const handleSave = (categoryId: string) => {
    updateBudget(categoryId, Number(editValue)); refreshData(); setEditingCat(null); setEditValue("")
  }

  if (!mounted) return <div className="animate-pulse"><div className="h-96 bg-[var(--color-secondary)] rounded-2xl" /></div>

  const totalBudget = budgets.reduce((s, b) => s + b.monthlyLimit, 0)
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0)
  const overBudgetCount = categories.filter(cat => {
    const spent = expenses.filter(e => e.categoryId === cat.id).reduce((s, e) => s + e.amount, 0)
    const budget = budgets.find(b => b.categoryId === cat.id)?.monthlyLimit || 0
    return spent > budget && budget > 0
  }).length

  return (
    <div className="space-y-6">
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <p className="text-xs font-bold text-orange-400 uppercase tracking-[0.2em] mb-1">Budgets</p>
        <h1 className="text-2xl sm:text-[1.75rem] font-bold tracking-tight">Control Your Limits</h1>
        <p className="text-[var(--color-muted-foreground)] text-xs mt-1">Set and manage category budgets</p>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-[11px] text-[var(--color-muted-foreground)] uppercase tracking-[0.15em] font-semibold mb-2">Total Budget</p>
          <p className="text-xl font-bold">{formatCurrency(totalBudget, user?.currency)}</p>
        </div>
        <div className="stat-card">
          <p className="text-[11px] text-[var(--color-muted-foreground)] uppercase tracking-[0.15em] font-semibold mb-2">Total Spent</p>
          <p className={`text-xl font-bold ${totalSpent > totalBudget ? "text-red-400" : "text-emerald-400"}`}>{formatCurrency(totalSpent, user?.currency)}</p>
        </div>
        <div className="stat-card">
          <p className="text-[11px] text-[var(--color-muted-foreground)] uppercase tracking-[0.15em] font-semibold mb-2">Over Budget</p>
          <p className={`text-xl font-bold ${overBudgetCount > 0 ? "text-red-400" : "text-emerald-400"}`}>{overBudgetCount} {overBudgetCount === 1 ? "category" : "categories"}</p>
        </div>
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-4">
        {categories.map((cat, i) => {
          const budget = budgets.find(b => b.categoryId === cat.id)?.monthlyLimit || 0
          const spent = expenses.filter(e => e.categoryId === cat.id).reduce((s, e) => s + e.amount, 0)
          const pct = budget > 0 ? (spent / budget) * 100 : 0
          const isOver = pct > 100
          const isEditing = editingCat === cat.id

          return (
            <motion.div key={cat.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
              <div className={`glass-card p-5 rounded-2xl ${isOver ? "border-red-500/20" : ""}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: cat.color + "15" }}>{cat.icon}</div>
                    <div>
                      <h3 className="font-semibold text-[13px]">{cat.name}</h3>
                      <p className="text-[11px] text-[var(--color-muted-foreground)]">{formatCurrency(spent, user?.currency)} spent</p>
                    </div>
                  </div>
                  {isOver && <AlertTriangle className="w-4 h-4 text-red-400" />}
                </div>

                <div className="h-[6px] bg-[var(--color-secondary)] rounded-full overflow-hidden mb-2">
                  <motion.div
                    className={`h-full rounded-full ${isOver ? "bg-red-500" : pct > 75 ? "bg-amber-500" : "bg-emerald-500"}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(pct, 100)}%` }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 + i * 0.03 }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[var(--color-muted-foreground)]">{pct.toFixed(0)}% used</span>
                  {isEditing ? (
                    <div className="flex items-center gap-1.5">
                      <div className="relative">
                        <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--color-muted-foreground)]" />
                        <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)}
                          className="w-20 pl-5 pr-2 py-1 input-premium text-xs" autoFocus />
                      </div>
                      <button onClick={() => handleSave(cat.id)} className="p-1.5 rounded-lg bg-orange-600 hover:bg-orange-700"><Check className="w-3 h-3" /></button>
                      <button onClick={() => setEditingCat(null)} className="p-1.5 rounded-lg bg-[var(--color-secondary)] hover:bg-[var(--color-border)] text-xs">✕</button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditingCat(cat.id); setEditValue(String(budget)) }}
                      className="text-[11px] text-orange-400 hover:text-orange-300 font-medium">
                      {formatCurrency(budget, user?.currency)} · Edit
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
