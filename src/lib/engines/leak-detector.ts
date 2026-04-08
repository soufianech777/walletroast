import { Expense, Category } from "../types"

export interface MoneyLeak {
  id: string
  title: string
  explanation: string
  monthlyLoss: number
  severity: "low" | "medium" | "high"
  type: "micro_spending" | "recurring" | "category_overuse" | "frequency"
  categoryIcon?: string
  categoryName?: string
  fixSuggestions: string[]
  occurrences: number
  timeframe: "7d" | "14d" | "30d"
}

export interface LeakSummary {
  leaks: MoneyLeak[]
  totalMonthlyLoss: number
  leakCount: number
  worstLeak: MoneyLeak | null
}

function generateLeakId(): string {
  return "leak_" + Math.random().toString(36).substring(2, 9)
}

/**
 * Detect micro-spending patterns: small repeated purchases (< $15) that add up
 */
function detectMicroSpending(
  expenses: Expense[],
  categories: Category[]
): MoneyLeak[] {
  const leaks: MoneyLeak[] = []
  const threshold = 15 // Small transaction threshold
  
  // Group small expenses by note/description patterns
  const smallExpenses = expenses.filter(e => e.amount <= threshold)
  
  // Group by category
  const byCat: Record<string, Expense[]> = {}
  smallExpenses.forEach(e => {
    const key = e.categoryId
    if (!byCat[key]) byCat[key] = []
    byCat[key].push(e)
  })
  
  for (const [catId, catExpenses] of Object.entries(byCat)) {
    if (catExpenses.length < 3) continue // Need at least 3 occurrences
    
    const total = catExpenses.reduce((s, e) => s + e.amount, 0)
    const cat = categories.find(c => c.id === catId)
    const avgAmount = total / catExpenses.length
    
    // Project to monthly
    const days = getDaySpan(catExpenses)
    const monthlyProjection = days > 0 ? (total / days) * 30 : total
    
    if (monthlyProjection < 20) continue // Too small to matter
    
    const severity: MoneyLeak["severity"] = monthlyProjection > 150 ? "high" : monthlyProjection > 60 ? "medium" : "low"
    
    leaks.push({
      id: generateLeakId(),
      title: `Daily ${cat?.name || "small"} spending`,
      explanation: `You made ${catExpenses.length} small purchases (avg $${avgAmount.toFixed(0)}) in ${cat?.name || "this category"}. These add up fast.`,
      monthlyLoss: Math.round(monthlyProjection),
      severity,
      type: "micro_spending",
      categoryIcon: cat?.icon,
      categoryName: cat?.name,
      fixSuggestions: [
        `Set a daily limit of $${Math.round(avgAmount)} for ${cat?.name || "this category"}`,
        `Try a "no-spend" challenge: skip ${cat?.name || "these purchases"} for 3 days/week`,
        `Replace with a cheaper alternative or batch your purchases`,
        `Track each purchase consciously — awareness alone cuts spending by 20%`,
      ],
      occurrences: catExpenses.length,
      timeframe: days <= 7 ? "7d" : days <= 14 ? "14d" : "30d",
    })
  }
  
  return leaks
}

/**
 * Detect recurring expenses: subscriptions, services, repeated same-amount transactions
 */
function detectRecurring(
  expenses: Expense[],
  categories: Category[]
): MoneyLeak[] {
  const leaks: MoneyLeak[] = []
  
  // Find expenses explicitly marked as recurring
  const recurringExpenses = expenses.filter(e => e.isRecurring)
  
  if (recurringExpenses.length > 0) {
    const totalRecurring = recurringExpenses.reduce((s, e) => s + e.amount, 0)
    
    if (totalRecurring > 30) {
      const severity: MoneyLeak["severity"] = totalRecurring > 200 ? "high" : totalRecurring > 80 ? "medium" : "low"
      
      leaks.push({
        id: generateLeakId(),
        title: `${recurringExpenses.length} active subscriptions`,
        explanation: `You have ${recurringExpenses.length} recurring expenses totaling $${totalRecurring.toFixed(0)}/month. When did you last review if you actually use all of them?`,
        monthlyLoss: Math.round(totalRecurring),
        severity,
        type: "recurring",
        categoryIcon: "🔄",
        categoryName: "Subscriptions",
        fixSuggestions: [
          "Audit every subscription: open each service and check your last login date",
          "Cancel anything you haven't used in 2+ weeks",
          "Downgrade premium plans to free tiers where possible",
          "Use a subscription manager to track all active services",
        ],
        occurrences: recurringExpenses.length,
        timeframe: "30d",
      })
    }
  }
  
  // Also detect same-amount transactions (likely subscriptions even if not marked)
  const amountGroups: Record<string, Expense[]> = {}
  expenses.forEach(e => {
    const key = e.amount.toFixed(2)
    if (!amountGroups[key]) amountGroups[key] = []
    amountGroups[key].push(e)
  })
  
  for (const [amount, group] of Object.entries(amountGroups)) {
    if (group.length < 2 || Number(amount) < 5) continue
    if (group.every(e => e.isRecurring)) continue // Already counted
    
    const cat = categories.find(c => c.id === group[0].categoryId)
    const monthly = Number(amount) * group.length
    
    if (monthly < 20) continue
    
    leaks.push({
      id: generateLeakId(),
      title: `Repeated $${Number(amount).toFixed(0)} charges`,
      explanation: `${group.length} identical charges of $${Number(amount).toFixed(2)} detected${cat ? ` in ${cat.name}` : ""}. This might be a hidden subscription or habitual purchase.`,
      monthlyLoss: Math.round(monthly),
      severity: monthly > 100 ? "high" : monthly > 40 ? "medium" : "low",
      type: "recurring",
      categoryIcon: cat?.icon || "💳",
      categoryName: cat?.name || "Unknown",
      fixSuggestions: [
        "Check if this is an auto-renewal you forgot about",
        "Review your bank statements for this exact amount",
        `Consider if you need this ${cat?.name || "expense"} at this frequency`,
      ],
      occurrences: group.length,
      timeframe: "30d",
    })
  }
  
  return leaks
}

/**
 * Detect category overuse: categories where daily frequency is unusually high
 */
function detectCategoryOveruse(
  expenses: Expense[],
  categories: Category[]
): MoneyLeak[] {
  const leaks: MoneyLeak[] = []
  
  const byCat: Record<string, Expense[]> = {}
  expenses.forEach(e => {
    if (!byCat[e.categoryId]) byCat[e.categoryId] = []
    byCat[e.categoryId].push(e)
  })
  
  for (const [catId, catExpenses] of Object.entries(byCat)) {
    const cat = categories.find(c => c.id === catId)
    if (!cat) continue
    
    const days = getDaySpan(catExpenses)
    if (days < 3) continue
    
    const freqPerDay = catExpenses.length / days
    const total = catExpenses.reduce((s, e) => s + e.amount, 0)
    const monthlyProjection = (total / days) * 30
    
    // High frequency = potential leak
    if (freqPerDay >= 1.5 && monthlyProjection > 50) {
      leaks.push({
        id: generateLeakId(),
        title: `${cat.name} overuse pattern`,
        explanation: `You're spending in ${cat.name} ${freqPerDay.toFixed(1)}x per day — that's ${catExpenses.length} transactions in ${days} days. This category is bleeding money.`,
        monthlyLoss: Math.round(monthlyProjection),
        severity: monthlyProjection > 200 ? "high" : monthlyProjection > 80 ? "medium" : "low",
        type: "category_overuse",
        categoryIcon: cat.icon,
        categoryName: cat.name,
        fixSuggestions: [
          `Limit ${cat.name} to once per day maximum`,
          `Set a hard budget cap of $${Math.round(monthlyProjection * 0.6)} for this category`,
          `Find free alternatives or batch your ${cat.name.toLowerCase()} needs`,
          `Try a 7-day "cold turkey" challenge for ${cat.name.toLowerCase()}`,
        ],
        occurrences: catExpenses.length,
        timeframe: days <= 7 ? "7d" : days <= 14 ? "14d" : "30d",
      })
    }
  }
  
  return leaks
}

function getDaySpan(expenses: Expense[]): number {
  if (expenses.length === 0) return 0
  const dates = expenses.map(e => new Date(e.expenseDate).getTime())
  const min = Math.min(...dates)
  const max = Math.max(...dates)
  return Math.max(1, Math.ceil((max - min) / (1000 * 60 * 60 * 24)) + 1)
}

/**
 * Main leak detection function
 */
export function detectMoneyLeaks(
  expenses: Expense[],
  categories: Category[],
  _currency: string
): LeakSummary {
  // Deduplicate leaks by type+category
  const allLeaks: MoneyLeak[] = [
    ...detectMicroSpending(expenses, categories),
    ...detectRecurring(expenses, categories),
    ...detectCategoryOveruse(expenses, categories),
  ]
  
  // Remove duplicates: keep the one with higher monthly loss for same category+type
  const deduped = new Map<string, MoneyLeak>()
  for (const leak of allLeaks) {
    const key = `${leak.type}_${leak.categoryName}`
    const existing = deduped.get(key)
    if (!existing || leak.monthlyLoss > existing.monthlyLoss) {
      deduped.set(key, leak)
    }
  }
  
  const leaks = Array.from(deduped.values())
    .sort((a, b) => b.monthlyLoss - a.monthlyLoss)
  
  const totalMonthlyLoss = leaks.reduce((s, l) => s + l.monthlyLoss, 0)
  
  return {
    leaks,
    totalMonthlyLoss,
    leakCount: leaks.length,
    worstLeak: leaks[0] || null,
  }
}
