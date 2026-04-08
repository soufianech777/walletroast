import { Expense, Category, Budget, RoastLevel } from "../types"

export interface WeeklyReport {
  weekLabel: string
  totalSpent: number
  transactionCount: number
  biggestWasteCategory: { name: string; icon: string; spent: number; overBy: number } | null
  disciplineScore: number
  prevDisciplineScore: number
  scoreChange: number
  estimatedWasted: number
  couldHaveSaved: number
  dailyAverage: number
  topInsights: string[]
  headline: string
  verdict: string
  grade: "A" | "B" | "C" | "D" | "F"
  gradeLabel: string
  topCategories: { name: string; icon: string; spent: number; pct: number }[]
  daysTracked: number
}

function getWeekRange(): { start: Date; end: Date; label: string } {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const start = new Date(now)
  start.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) - 7)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)

  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  return { start, end, label: `${fmt(start)} – ${fmt(end)}` }
}

export function generateWeeklyReport(
  expenses: Expense[],
  categories: Category[],
  budgets: Budget[],
  monthlyIncome: number,
  roastLevel: RoastLevel,
  currentScore: number
): WeeklyReport {
  const { start, end, label } = getWeekRange()

  // Filter expenses to this week
  const weekExpenses = expenses.filter(e => {
    const d = new Date(e.expenseDate)
    return d >= start && d <= end
  })

  // Also get prev week for score comparison
  const prevStart = new Date(start)
  prevStart.setDate(prevStart.getDate() - 7)
  const prevEnd = new Date(start)
  prevEnd.setDate(prevEnd.getDate() - 1)
  const prevWeekExpenses = expenses.filter(e => {
    const d = new Date(e.expenseDate)
    return d >= prevStart && d <= prevEnd
  })

  const totalSpent = weekExpenses.reduce((s, e) => s + e.amount, 0)
  const prevTotalSpent = prevWeekExpenses.reduce((s, e) => s + e.amount, 0)
  const transactionCount = weekExpenses.length
  const weeklyBudget = monthlyIncome / 4

  // Category breakdown
  const catSpending = categories.map(cat => {
    const spent = weekExpenses.filter(e => e.categoryId === cat.id).reduce((s, e) => s + e.amount, 0)
    const budget = budgets.find(b => b.categoryId === cat.id)?.monthlyLimit || 0
    const weekBudget = budget / 4
    return { name: cat.name, icon: cat.icon, spent, budget: weekBudget, overBy: Math.max(0, spent - weekBudget) }
  }).filter(c => c.spent > 0).sort((a, b) => b.spent - a.spent)

  const biggestWaste = catSpending.find(c => c.overBy > 0) || null
  const estimatedWasted = catSpending.reduce((s, c) => s + c.overBy, 0)
  const couldHaveSaved = Math.max(0, totalSpent - weeklyBudget * 0.75)

  // Days actually tracked
  const uniqueDays = new Set(weekExpenses.map(e => new Date(e.expenseDate).toDateString())).size
  const dailyAverage = uniqueDays > 0 ? totalSpent / uniqueDays : 0

  // Simulated score change
  const prevScore = Math.min(100, Math.max(0, currentScore + (prevTotalSpent > totalSpent ? -5 : 5)))
  const scoreChange = currentScore - prevScore

  // Grade
  const spendRatio = totalSpent / weeklyBudget
  let grade: WeeklyReport["grade"], gradeLabel: string
  if (spendRatio <= 0.6) { grade = "A"; gradeLabel = "Excellent" }
  else if (spendRatio <= 0.8) { grade = "B"; gradeLabel = "Good" }
  else if (spendRatio <= 1.0) { grade = "C"; gradeLabel = "Average" }
  else if (spendRatio <= 1.3) { grade = "D"; gradeLabel = "Poor" }
  else { grade = "F"; gradeLabel = "Critical" }

  // Generate insights
  const insights: string[] = []
  if (biggestWaste) {
    if (roastLevel === "brutal") {
      insights.push(`${biggestWaste.icon} ${biggestWaste.name} ate $${biggestWaste.overBy.toFixed(0)} more than it should have. Fix it or accept being broke.`)
    } else if (roastLevel === "direct") {
      insights.push(`${biggestWaste.icon} ${biggestWaste.name} was your biggest overspend at $${biggestWaste.overBy.toFixed(0)} over budget.`)
    } else {
      insights.push(`${biggestWaste.icon} ${biggestWaste.name} was a bit over budget by $${biggestWaste.overBy.toFixed(0)} — maybe try to cut back here.`)
    }
  }
  if (totalSpent > prevTotalSpent && prevTotalSpent > 0) {
    const pctIncrease = ((totalSpent - prevTotalSpent) / prevTotalSpent * 100).toFixed(0)
    if (roastLevel === "brutal") {
      insights.push(`📈 Spending jumped ${pctIncrease}% from last week. You're going backwards.`)
    } else {
      insights.push(`📈 Spending increased ${pctIncrease}% compared to last week.`)
    }
  } else if (totalSpent < prevTotalSpent && prevTotalSpent > 0) {
    const pctDecrease = ((prevTotalSpent - totalSpent) / prevTotalSpent * 100).toFixed(0)
    insights.push(`📉 You spent ${pctDecrease}% less than last week. Keep this momentum.`)
  }
  if (dailyAverage > monthlyIncome / 30) {
    if (roastLevel === "brutal") {
      insights.push(`⚡ Daily average is $${dailyAverage.toFixed(0)} — you're outspending your income rate. Unsustainable.`)
    } else {
      insights.push(`⚡ Daily average of $${dailyAverage.toFixed(0)} is above your sustainable daily budget.`)
    }
  }
  if (couldHaveSaved > 0) {
    insights.push(`💰 You could have saved $${couldHaveSaved.toFixed(0)} this week with better discipline.`)
  }

  // Headline
  let headline: string
  if (grade === "A") {
    headline = roastLevel === "brutal" ? "Surprisingly, you didn't embarrass yourself this week." : "Great week. Your money is in good hands."
  } else if (grade === "B") {
    headline = roastLevel === "brutal" ? "Decent. Not great. Room to improve." : "Good week overall, with small areas to improve."
  } else if (grade === "C") {
    headline = roastLevel === "brutal" ? "This week cost you more than it should." : "An average week — you can do better."
  } else if (grade === "D") {
    headline = roastLevel === "brutal" ? "Your wallet took a beating this week. Stop the damage." : "A rough week for your finances."
  } else {
    headline = roastLevel === "brutal" ? "This week was a financial disaster. Wake up." : "This week needs serious attention."
  }

  // Verdict
  let verdict: string
  if (grade === "A" || grade === "B") {
    verdict = roastLevel === "brutal"
      ? "Don't celebrate yet. One good week doesn't fix months of damage. Stay disciplined."
      : "You're building good habits. Stay consistent and this will compound in your favor."
  } else {
    verdict = roastLevel === "brutal"
      ? "Next week, you either fix this or you keep bleeding money. Your choice."
      : "Review your spending patterns and set firmer limits for next week. You've got this."
  }

  // Top categories for chart
  const topCategories = catSpending.slice(0, 5).map(c => ({
    name: c.name,
    icon: c.icon,
    spent: c.spent,
    pct: totalSpent > 0 ? (c.spent / totalSpent) * 100 : 0,
  }))

  return {
    weekLabel: label,
    totalSpent,
    transactionCount,
    biggestWasteCategory: biggestWaste,
    disciplineScore: currentScore,
    prevDisciplineScore: prevScore,
    scoreChange,
    estimatedWasted,
    couldHaveSaved,
    dailyAverage,
    topInsights: insights.slice(0, 3),
    headline,
    verdict,
    grade,
    gradeLabel,
    topCategories,
    daysTracked: uniqueDays,
  }
}
