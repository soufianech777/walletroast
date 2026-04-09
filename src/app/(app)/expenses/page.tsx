"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus, Search, Trash2, Edit2, X,
  DollarSign, RefreshCw
} from "lucide-react"
import { getUser, getCategories, getExpenses, addExpense, deleteExpense, updateExpense } from "@/lib/store"
import { formatCurrency, formatDate } from "@/lib/utils"
import { QUICK_ADD_PRESETS } from "@/lib/types"
import type { Expense, Category } from "@/lib/types"

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } }
}

export default function ExpensesPage() {
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [filterCat, setFilterCat] = useState("")
  const [mounted, setMounted] = useState(false)
  const [amount, setAmount] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [note, setNote] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [isRecurring, setIsRecurring] = useState(false)

  useEffect(() => {
    const u = getUser()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (u) setUser(u)
    setExpenses(getExpenses())
    setCategories(getCategories())
    setMounted(true)
  }, [])

  const refreshData = () => setExpenses(getExpenses())
  const resetForm = () => { setAmount(""); setCategoryId(""); setNote(""); setDate(new Date().toISOString().split("T")[0]); setIsRecurring(false); setEditingId(null); setShowForm(false) }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      updateExpense(editingId, { amount: Number(amount), categoryId, note, expenseDate: new Date(date).toISOString(), isRecurring, recurringType: isRecurring ? "monthly" : null })
    } else {
      addExpense({ amount: Number(amount), categoryId, note, expenseDate: new Date(date).toISOString(), isRecurring, recurringType: isRecurring ? "monthly" : null })
    }
    refreshData(); resetForm()
  }

  const handleQuickAdd = (preset: typeof QUICK_ADD_PRESETS[0]) => {
    const cat = categories.find(c => c.name === preset.categoryName)
    if (cat) { addExpense({ amount: preset.defaultAmount, categoryId: cat.id, note: preset.name, expenseDate: new Date().toISOString(), isRecurring: false, recurringType: null }); refreshData() }
  }

  const handleEdit = (expense: Expense) => {
    setAmount(String(expense.amount)); setCategoryId(expense.categoryId); setNote(expense.note)
    setDate(new Date(expense.expenseDate).toISOString().split("T")[0]); setIsRecurring(expense.isRecurring)
    setEditingId(expense.id); setShowForm(true)
  }

  if (!mounted) return <div className="animate-pulse"><div className="h-96 bg-[var(--color-secondary)] rounded-2xl" /></div>

  const filteredExpenses = expenses
    .filter(e => !search || e.note.toLowerCase().includes(search.toLowerCase()) || e.category?.name.toLowerCase().includes(search.toLowerCase()))
    .filter(e => !filterCat || e.categoryId === filterCat)
    .sort((a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime())

  const totalFiltered = filteredExpenses.reduce((s, e) => s + e.amount, 0)

  return (
    <div className="space-y-6">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-orange-400 uppercase tracking-[0.2em] mb-1">Expenses</p>
          <h1 className="text-2xl sm:text-[1.75rem] font-bold tracking-tight">Track Your Spending</h1>
          <p className="text-[var(--color-muted-foreground)] text-xs mt-1">{expenses.length} total · {formatCurrency(totalFiltered, user?.currency)} shown</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true) }}
          className="btn-primary px-5 py-2.5 rounded-xl text-[13px] font-semibold flex items-center gap-2 self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Add Expense
        </button>
      </motion.div>

      {/* Quick Add */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <div className="glass-card p-5 rounded-2xl">
          <p className="text-[11px] text-[var(--color-muted-foreground)] uppercase tracking-[0.15em] font-semibold mb-3">Quick Add</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_ADD_PRESETS.map(preset => (
              <button key={preset.name} onClick={() => handleQuickAdd(preset)}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--color-secondary)] hover:bg-[var(--color-border)] border border-[var(--color-border)] hover:border-orange-500/30 rounded-xl text-[13px] transition-all duration-200 hover:-translate-y-0.5">
                <span>{preset.icon}</span><span>{preset.name}</span>
                <span className="text-[var(--color-muted-foreground)]">${preset.defaultAmount}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)]" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search expenses..."
            className="w-full pl-10 pr-4 py-2.5 input-premium" />
        </div>
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
          className="px-4 py-2.5 input-premium min-w-[160px]">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={resetForm} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-x-4 top-[10%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-md z-50">
              <div className="glass-card p-6 rounded-2xl border border-[var(--color-border)]">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-base font-bold">{editingId ? "Edit Expense" : "Add Expense"}</h2>
                  <button onClick={resetForm} className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[12px] text-[var(--color-muted-foreground)] mb-1.5 font-medium">Amount</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)]" />
                      <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full pl-10 pr-4 input-premium" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[12px] text-[var(--color-muted-foreground)] mb-1.5 font-medium">Category</label>
                    <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full input-premium" required>
                      <option value="">Select category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12px] text-[var(--color-muted-foreground)] mb-1.5 font-medium">Note</label>
                    <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="What was this for?" className="w-full input-premium" />
                  </div>
                  <div>
                    <label className="block text-[12px] text-[var(--color-muted-foreground)] mb-1.5 font-medium">Date</label>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full input-premium" />
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setIsRecurring(!isRecurring)}
                      className={`w-10 h-5.5 rounded-full transition-all relative ${isRecurring ? "bg-orange-600" : "bg-[var(--color-border)]"}`}>
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-[3px] transition-all shadow-sm ${isRecurring ? "left-[22px]" : "left-[3px]"}`} />
                    </button>
                    <span className="text-[13px] text-[var(--color-muted-foreground)]">Recurring (monthly)</span>
                  </div>
                  <button type="submit" className="w-full py-2.5 btn-primary rounded-xl text-[13px] font-semibold">{editingId ? "Update" : "Add Expense"}</button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Expense List */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {filteredExpenses.length === 0 ? (
          <div className="p-14 text-center">
            <p className="text-[var(--color-muted-foreground)] text-base mb-1">No expenses found</p>
            <p className="text-[var(--color-muted-foreground)] text-xs opacity-60">Start tracking by adding an expense</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]/50">
            {filteredExpenses.map((expense, i) => (
              <motion.div key={expense.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                className="flex items-center justify-between p-4 hover:bg-[var(--color-secondary)]/30 transition-colors group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                    style={{ backgroundColor: (expense.category?.color || "#6b7280") + "15" }}>
                    {expense.category?.icon || "📦"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium truncate">
                      {expense.note || expense.category?.name || "Expense"}
                      {expense.isRecurring && <RefreshCw className="inline w-3 h-3 text-orange-400 ml-1.5" />}
                    </p>
                    <p className="text-[11px] text-[var(--color-muted-foreground)]">{expense.category?.name} · {formatDate(expense.expenseDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[13px] font-bold">{formatCurrency(expense.amount, user?.currency)}</span>
                  <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(expense)} className="p-1.5 rounded-lg hover:bg-[var(--color-secondary)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-all">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => { deleteExpense(expense.id); refreshData() }} className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--color-muted-foreground)] hover:text-red-400 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
