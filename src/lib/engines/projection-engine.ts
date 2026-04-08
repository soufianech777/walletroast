import { RoastLevel, ProjectionData } from "../types"
import { getMonthDays } from "../utils"

export function calculateProjection(
  totalSpent: number,
  monthlyIncome: number,
  roastLevel: RoastLevel,
  savingsGoal: number
): ProjectionData {
  const { elapsed, remaining, total } = getMonthDays()

  const dailyAverage = elapsed > 0 ? totalSpent / elapsed : 0
  const projectedTotalSpend = dailyAverage * total
  const projectedBalance = monthlyIncome - projectedTotalSpend
  const isPositive = projectedBalance > 0

  let message = ""

  if (isPositive) {
    const canSave = projectedBalance >= savingsGoal
    if (canSave) {
      const msgs = {
        soft: `Great news! At this pace, you'll have $${projectedBalance.toFixed(0)} left and hit your savings goal.`,
        direct: `Projected balance: $${projectedBalance.toFixed(0)}. Savings goal is achievable. Don't slip now.`,
        brutal: `$${projectedBalance.toFixed(0)} projected surplus. Don't celebrate yet — you haven't earned it until month-end.`,
      }
      message = msgs[roastLevel]
    } else {
      const msgs = {
        soft: `You'll have $${projectedBalance.toFixed(0)} left, but that's below your savings goal of $${savingsGoal}. Consider cutting back a bit.`,
        direct: `Projected: $${projectedBalance.toFixed(0)} remaining. That's below your $${savingsGoal} goal. Reduce spending by $${(savingsGoal - projectedBalance).toFixed(0)}.`,
        brutal: `$${projectedBalance.toFixed(0)} left? Your savings goal is $${savingsGoal}. You're $${(savingsGoal - projectedBalance).toFixed(0)} short. Tighten up or stay broke.`,
      }
      message = msgs[roastLevel]
    }
  } else {
    const deficit = Math.abs(projectedBalance)
    const msgs = {
      soft: `At the current rate, you might overspend by $${deficit.toFixed(0)} this month. Let's try to slow down spending.`,
      direct: `You're projected to overspend by $${deficit.toFixed(0)}. You have ${remaining} days to fix this. Cut $${(deficit / Math.max(remaining, 1)).toFixed(0)}/day.`,
      brutal: `You'll be $${deficit.toFixed(0)} in the hole by month-end. ${remaining} days left. That's $${(deficit / Math.max(remaining, 1)).toFixed(0)}/day you need to NOT spend. Can you manage that?`,
    }
    message = msgs[roastLevel]
  }

  return {
    projectedBalance,
    dailyAverage,
    message,
    isPositive,
  }
}
