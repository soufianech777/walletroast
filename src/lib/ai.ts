import { GoogleGenAI } from "@google/genai"

const apiKey = process.env.GEMINI_API_KEY

let ai: GoogleGenAI | null = null
if (apiKey) {
  ai = new GoogleGenAI({ apiKey })
}

// ═══════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════

export interface SpendingSummary {
  monthlyIncome: number
  totalSpent: number
  categories: { name: string; spent: number; budget: number }[]
  disciplineScore: number
  roastLevel: "soft" | "direct" | "brutal"
  topCategory: string
  daysLeft: number
  savingsGoal?: number
  savedAmount?: number
}

export interface GoalSummary {
  title: string
  targetAmount: number
  savedAmount: number
  deadline: string
  daysLeft: number
  monthlyIncome: number
  totalSpent: number
}

// ═══════════════════════════════════════════════════════
// CORE GENERATION (server-side only)
// ═══════════════════════════════════════════════════════

async function generate(prompt: string): Promise<string | null> {
  if (!ai) return null

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        maxOutputTokens: 300,
        temperature: 0.9,
      },
    })
    return response.text?.trim() || null
  } catch (error) {
    console.error("[AI] Gemini error:", error)
    return null
  }
}

// ═══════════════════════════════════════════════════════
// AI ROAST GENERATOR
// ═══════════════════════════════════════════════════════

export async function generateAIRoast(data: SpendingSummary): Promise<string | null> {
  const toneGuide = {
    soft: "Be gentle but honest. Use humor lightly. Suggest improvements kindly.",
    direct: "Be blunt and straightforward. No sugarcoating. Facts hit hard.",
    brutal: "Be savage and hilarious. Absolutely destroy their spending habits with brutal comedy. Use creative metaphors and dark humor. Be merciless but funny.",
  }

  const catBreakdown = data.categories
    .slice(0, 5)
    .map(c => `${c.name}: $${c.spent.toFixed(0)} spent${c.budget > 0 ? ` (budget: $${c.budget})` : ""}`)
    .join(", ")

  const prompt = `You are WalletRoast, a brutally honest personal finance roasting AI. Your job is to roast someone's spending habits.

TONE: ${toneGuide[data.roastLevel]}

USER'S FINANCIAL DATA:
- Monthly income: $${data.monthlyIncome.toFixed(0)}
- Total spent this month: $${data.totalSpent.toFixed(0)}
- Days left in month: ${data.daysLeft}
- Discipline score: ${data.disciplineScore}/100
- Top spending: ${catBreakdown}
- Biggest category: ${data.topCategory}

RULES:
1. Write ONE single roast paragraph (2-3 sentences max)
2. Reference their ACTUAL spending numbers
3. Be specific about their worst category
4. End with a short actionable tip
5. Use emojis sparingly (max 1-2)
6. Do NOT use markdown formatting
7. Sound like a witty friend, not a bot

Generate the roast:`

  return generate(prompt)
}

// ═══════════════════════════════════════════════════════
// AI INSIGHTS GENERATOR
// ═══════════════════════════════════════════════════════

export async function generateAIInsights(data: SpendingSummary): Promise<string | null> {
  const catBreakdown = data.categories
    .slice(0, 8)
    .map(c => {
      const pct = c.budget > 0 ? ((c.spent / c.budget) * 100).toFixed(0) : "no budget"
      return `${c.name}: $${c.spent.toFixed(0)} (${pct}% of budget)`
    })
    .join("\n  ")

  const prompt = `You are WalletRoast's AI financial analyst. Analyze this person's spending and give sharp, actionable insights.

FINANCIAL DATA:
- Monthly income: $${data.monthlyIncome.toFixed(0)}
- Total spent: $${data.totalSpent.toFixed(0)} (${((data.totalSpent / data.monthlyIncome) * 100).toFixed(0)}% of income)
- Discipline score: ${data.disciplineScore}/100
- Days left: ${data.daysLeft}
- Category breakdown:
  ${catBreakdown}

RULES:
1. Give exactly 3 bullet insights, each 1-2 sentences
2. First: biggest problem area with specific numbers
3. Second: a hidden pattern or surprise in their data
4. Third: one specific action to save money this week
5. Be direct and specific — use their real numbers
6. Use the ${data.roastLevel} tone (${data.roastLevel === "brutal" ? "savage and funny" : data.roastLevel === "direct" ? "blunt and honest" : "kind but truthful"})
7. Format as: "• [insight]" for each point
8. Do NOT use markdown headers or bold

Analyze:`

  return generate(prompt)
}

// ═══════════════════════════════════════════════════════
// AI GOAL ADVISOR
// ═══════════════════════════════════════════════════════

export async function generateAIGoalAdvice(goal: GoalSummary): Promise<string | null> {
  const progress = goal.targetAmount > 0 ? ((goal.savedAmount / goal.targetAmount) * 100).toFixed(0) : "0"
  const remaining = goal.targetAmount - goal.savedAmount
  const monthlyNeeded = goal.daysLeft > 0 ? (remaining / (goal.daysLeft / 30)).toFixed(0) : "N/A"

  const prompt = `You are WalletRoast's AI goal coach. Give a short, motivating tip for reaching a savings goal.

GOAL DATA:
- Goal: "${goal.title}"
- Target: $${goal.targetAmount.toFixed(0)}
- Saved so far: $${goal.savedAmount.toFixed(0)} (${progress}%)
- Remaining: $${remaining.toFixed(0)}
- Days left: ${goal.daysLeft}
- Monthly savings needed: $${monthlyNeeded}
- Monthly income: $${goal.monthlyIncome.toFixed(0)}
- Monthly spending: $${goal.totalSpent.toFixed(0)}

RULES:
1. Give ONE short paragraph (2 sentences max)
2. Be specific with numbers — tell them exactly how much to save per week/day
3. Suggest one concrete cut they could make
4. Be encouraging but realistic
5. Do NOT use markdown

Advise:`

  return generate(prompt)
}

// ═══════════════════════════════════════════════════════
// AI DAILY TIP
// ═══════════════════════════════════════════════════════

export async function generateAIDailyTip(data: SpendingSummary): Promise<string | null> {
  const prompt = `You are WalletRoast. Give a one-sentence daily money tip personalized to someone who:
- Earns $${data.monthlyIncome.toFixed(0)}/month
- Has spent $${data.totalSpent.toFixed(0)} this month
- Discipline score: ${data.disciplineScore}/100
- Top spending category: ${data.topCategory}

RULES: One sentence only. Be specific and actionable. ${data.roastLevel === "brutal" ? "Add dark humor." : ""} No markdown. No emojis.

Tip:`

  return generate(prompt)
}

export function isAIAvailable(): boolean {
  return !!apiKey
}
