import { CategorySpending } from "../types"

interface ScoreFactors {
  categorySpending: CategorySpending[]
  hasSubscriptions: boolean
  subscriptionCount: number
  savingsContribution: number
  totalExpenseCount: number
  daysTracked: number
}

interface ScoreBreakdown {
  score: number
  factors: { label: string; impact: number }[]
}

export function calculateDisciplineScore(factors: ScoreFactors): ScoreBreakdown {
  let score = 100
  const breakdown: { label: string; impact: number }[] = []

  // Check over-budget categories
  const overBudgetCategories = factors.categorySpending.filter(c => c.percentage > 100)
  overBudgetCategories.forEach(cat => {
    const overPercent = cat.percentage - 100
    let penalty = 0
    if (overPercent > 50) penalty = -15
    else if (overPercent > 25) penalty = -10
    else penalty = -5
    score += penalty
    breakdown.push({ label: `${cat.category.name} over budget`, impact: penalty })
  })

  // Too many subscriptions
  if (factors.subscriptionCount > 5) {
    score -= 5
    breakdown.push({ label: "Too many subscriptions", impact: -5 })
  }

  // No savings
  if (factors.savingsContribution <= 0) {
    score -= 10
    breakdown.push({ label: "No savings contributions", impact: -10 })
  }

  // Impulse purchases (high expense count relative to tracked days)
  if (factors.daysTracked > 0) {
    const avgPerDay = factors.totalExpenseCount / factors.daysTracked
    if (avgPerDay > 5) {
      score -= 10
      breakdown.push({ label: "Frequent impulse purchases", impact: -10 })
    } else if (avgPerDay > 3) {
      score -= 5
      breakdown.push({ label: "Moderate impulse purchases", impact: -5 })
    }
  }

  // Positive factors
  const allUnderBudget = factors.categorySpending.every(c => c.percentage <= 100)
  if (allUnderBudget && factors.categorySpending.length > 0) {
    score += 10
    breakdown.push({ label: "All categories under budget", impact: 10 })
  }

  if (factors.savingsContribution > 0) {
    score += 10
    breakdown.push({ label: "Active savings", impact: 10 })
  }

  // Consistent tracking bonus
  if (factors.daysTracked >= 20) {
    score += 5
    breakdown.push({ label: "Consistent tracking", impact: 5 })
  }

  // Clamp to 0-100
  score = Math.max(0, Math.min(100, score))

  return { score, factors: breakdown }
}
