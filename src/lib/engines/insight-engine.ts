import { RoastLevel, Insight, InsightSeverity, InsightType, CategorySpending } from "../types"
import { generateId, getMonthDays } from "../utils"

interface InsightRule {
  type: InsightType
  severity: InsightSeverity
  check: (data: InsightContext) => boolean
  messages: Record<RoastLevel, { title: string; message: string }>
}

interface InsightContext {
  totalSpent: number
  monthlyIncome: number
  remainingBalance: number
  categorySpending: CategorySpending[]
  savingsThisMonth: number
  daysWithoutTracking: number
  dailyExpenseCounts: Record<string, number>
}

const rules: InsightRule[] = [
  {
    type: "food_overspend",
    severity: "warning",
    check: (ctx) => {
      const foodSpending = ctx.categorySpending.find(c =>
        c.category.name.toLowerCase().includes("food") || c.category.name.toLowerCase().includes("dining")
      )
      return foodSpending ? foodSpending.spent > ctx.monthlyIncome * 0.25 : false
    },
    messages: {
      soft: {
        title: "Food spending is high",
        message: "You're spending more than planned on food and dining. Consider meal prepping to save some money this month.",
      },
      direct: {
        title: "Food is eating your budget",
        message: "Over 25% of your income is going to food. Cut back now — cook at home, skip the delivery apps.",
      },
      brutal: {
        title: "Your kitchen is a museum",
        message: "You're feeding restaurants more than yourself. 25% of your income on food? Your fridge is crying. Cook something.",
      },
    },
  },
  {
    type: "subscription_drain",
    severity: "warning",
    check: (ctx) => {
      const subSpending = ctx.categorySpending.find(c =>
        c.category.name.toLowerCase().includes("subscription")
      )
      return subSpending ? subSpending.spent > ctx.monthlyIncome * 0.05 : false
    },
    messages: {
      soft: {
        title: "Subscriptions adding up",
        message: "Your subscriptions might be costing more than you realize. Review which ones you actually use regularly.",
      },
      direct: {
        title: "Subscriptions are draining you",
        message: "Too many subscriptions. Cancel what you don't use weekly. Every unused subscription is money burned.",
      },
      brutal: {
        title: "Cancel or go broke",
        message: "You're collecting subscriptions like they're trophies. Netflix, Spotify, that gym you never visit — pick 2, cancel the rest.",
      },
    },
  },
  {
    type: "low_balance",
    severity: "danger",
    check: (ctx) => ctx.remainingBalance < ctx.monthlyIncome * 0.1,
    messages: {
      soft: {
        title: "Balance getting low",
        message: "Your remaining balance is under 10% of your income. Try to limit spending for the rest of the month.",
      },
      direct: {
        title: "You're almost broke this month",
        message: "Less than 10% of your income left. Stop all non-essential spending immediately.",
      },
      brutal: {
        title: "Your wallet is flatlined",
        message: "You have almost nothing left. Congratulations on speed-running poverty this month. Stop spending. Now.",
      },
    },
  },
  {
    type: "shopping_spike",
    severity: "warning",
    check: (ctx) => {
      const shopping = ctx.categorySpending.find(c =>
        c.category.name.toLowerCase().includes("shopping")
      )
      return shopping ? shopping.percentage > 120 : false
    },
    messages: {
      soft: {
        title: "Shopping has increased",
        message: "Your shopping spending is higher than your budget. Keep an eye on impulse purchases.",
      },
      direct: {
        title: "Shopping is out of control",
        message: "You've blown past your shopping budget. Every purchase from now on better be essential.",
      },
      brutal: {
        title: "You shop like therapy is free",
        message: "Your shopping is 120% over budget. Your closet is full. Your wallet is empty. See the problem?",
      },
    },
  },
  {
    type: "savings_achiever",
    severity: "positive",
    check: (ctx) => ctx.savingsThisMonth > 0,
    messages: {
      soft: {
        title: "Great job saving!",
        message: "You've contributed to your savings this month. Keep this positive habit going!",
      },
      direct: {
        title: "Savings on track",
        message: "You're saving. Good. Don't stop. Consistency is what separates builders from breakers.",
      },
      brutal: {
        title: "Finally, some discipline",
        message: "You actually saved money? I'm impressed. Don't let it go to your head — keep going.",
      },
    },
  },
  {
    type: "budget_discipline",
    severity: "positive",
    check: (ctx) => ctx.categorySpending.every(c => c.percentage <= 100) && ctx.categorySpending.length > 0,
    messages: {
      soft: {
        title: "All budgets on track!",
        message: "You're staying within all your category budgets. Wonderful discipline this month!",
      },
      direct: {
        title: "Budget discipline is solid",
        message: "Every category is under budget. This is how you build wealth. Keep it locked in.",
      },
      brutal: {
        title: "Who are you and what happened?",
        message: "All categories under budget? Either you're lying or you've actually grown up. Keep this energy.",
      },
    },
  },
  {
    type: "no_tracking",
    severity: "info",
    check: (ctx) => ctx.daysWithoutTracking >= 3,
    messages: {
      soft: {
        title: "Haven't tracked recently",
        message: "It's been a few days since you logged an expense. Tracking consistently helps you stay aware.",
      },
      direct: {
        title: "Track your expenses",
        message: "3+ days without logging. You can't fix what you don't measure. Open the app and track.",
      },
      brutal: {
        title: "Ghosting your finances?",
        message: "3 days without tracking. Ignoring your money doesn't make it grow. It makes it disappear. Log. Now.",
      },
    },
  },
  {
    type: "impulse_pattern",
    severity: "warning",
    check: (ctx) => {
      return Object.values(ctx.dailyExpenseCounts).some(count => count >= 5)
    },
    messages: {
      soft: {
        title: "Multiple purchases today",
        message: "You've made several purchases in one day. Consider whether each one was necessary.",
      },
      direct: {
        title: "Impulse buying detected",
        message: "5+ transactions in a single day. That's impulse buying. Take a breath before every purchase.",
      },
      brutal: {
        title: "Your card is on fire",
        message: "5+ swipes in one day? Your debit card needs a restraining order. Every tap is a leak in your wallet.",
      },
    },
  },
]

export function generateInsights(
  roastLevel: RoastLevel,
  totalSpent: number,
  monthlyIncome: number,
  categorySpending: CategorySpending[],
  savingsThisMonth: number,
  expenses: { expenseDate: Date | string }[]
): Insight[] {
  const now = new Date()
  const { elapsed } = getMonthDays()
  
  // Calculate days without tracking
  let daysWithoutTracking = 0
  if (expenses.length > 0) {
    const lastExpenseDate = new Date(
      Math.max(...expenses.map(e => new Date(e.expenseDate).getTime()))
    )
    daysWithoutTracking = Math.floor((now.getTime() - lastExpenseDate.getTime()) / (1000 * 60 * 60 * 24))
  } else {
    daysWithoutTracking = elapsed
  }
  
  // Count expenses per day
  const dailyExpenseCounts: Record<string, number> = {}
  expenses.forEach(e => {
    const dateKey = new Date(e.expenseDate).toDateString()
    dailyExpenseCounts[dateKey] = (dailyExpenseCounts[dateKey] || 0) + 1
  })
  
  const remainingBalance = monthlyIncome - totalSpent
  
  const ctx: InsightContext = {
    totalSpent,
    monthlyIncome,
    remainingBalance,
    categorySpending,
    savingsThisMonth,
    daysWithoutTracking,
    dailyExpenseCounts,
  }
  
  const insights: Insight[] = []
  
  for (const rule of rules) {
    if (rule.check(ctx)) {
      const { title, message } = rule.messages[roastLevel]
      insights.push({
        id: generateId(),
        userId: "",
        type: rule.type,
        severity: rule.severity,
        title,
        message,
        generatedForDate: now.toISOString(),
      })
    }
  }
  
  // Sort: danger first, then warning, then info, then positive
  const severityOrder: Record<string, number> = { danger: 0, warning: 1, info: 2, positive: 3 }
  insights.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])
  
  return insights
}

export function getBiggestWaste(categorySpending: CategorySpending[]): CategorySpending | null {
  const overBudget = categorySpending.filter(c => c.percentage > 100)
  if (overBudget.length === 0) return null
  return overBudget.sort((a, b) => (b.spent - b.budget) - (a.spent - a.budget))[0]
}

export function getEasiestFix(categorySpending: CategorySpending[], roastLevel: RoastLevel): string {
  const overBudget = categorySpending
    .filter(c => c.percentage > 100)
    .sort((a, b) => (a.spent - a.budget) - (b.spent - b.budget))
  
  if (overBudget.length === 0) {
    const msgs = {
      soft: "You're doing well! Keep maintaining your budgets.",
      direct: "No easy fixes needed. You're disciplined. Stay sharp.",
      brutal: "Nothing to fix? Suspicious. Don't get comfortable.",
    }
    return msgs[roastLevel]
  }
  
  const fix = overBudget[0]
  const overBy = fix.spent - fix.budget
  const msgs = {
    soft: `Reducing ${fix.category.name} by $${overBy.toFixed(0)} would bring you back on track.`,
    direct: `Cut $${overBy.toFixed(0)} from ${fix.category.name}. That's your quickest win.`,
    brutal: `Stop wasting $${overBy.toFixed(0)} on ${fix.category.name}. That's the easiest money you'll ever save.`,
  }
  return msgs[roastLevel]
}
