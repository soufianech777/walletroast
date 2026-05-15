import { NextResponse } from "next/server"
import { generateAIRoast } from "@/lib/ai"
import { auth } from "@clerk/nextjs/server"
import { validateRequest, apiError } from "@/lib/api-security"
import { z } from "zod"

const spendingSummarySchema = z.object({
  monthlyIncome: z.number().min(0),
  totalSpent: z.number().min(0),
  categories: z.array(z.object({
    name: z.string(),
    spent: z.number().min(0),
    budget: z.number().min(0)
  })).max(100),
  disciplineScore: z.number().min(0).max(100),
  roastLevel: z.enum(["soft", "direct", "brutal"]),
  topCategory: z.string(),
  daysLeft: z.number().min(0).max(31),
  savingsGoal: z.number().min(0).optional(),
  savedAmount: z.number().min(0).optional(),
})

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const validation = await validateRequest(request, spendingSummarySchema)
    if (!validation.success) {
      return validation.response
    }

    const body = validation.data
    const roast = await generateAIRoast(body)

    if (!roast) {
      return NextResponse.json({ error: "AI unavailable", fallback: true }, { status: 503 })
    }

    return NextResponse.json({ roast })
  } catch (error) {
    console.error("[AI Roast] Error:", error)
    return apiError("Failed to generate roast")
  }
}
