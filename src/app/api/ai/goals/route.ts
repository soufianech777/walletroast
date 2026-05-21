import { NextResponse } from "next/server"
import { generateAIGoalAdvice } from "@/lib/ai"
import { auth } from "@clerk/nextjs/server"
import { validateRequest, apiError } from "@/lib/api-security"
import { z } from "zod"

const goalSummarySchema = z.object({
  title: z.string().max(500),
  targetAmount: z.number().min(0),
  savedAmount: z.number().min(0),
  deadline: z.string(),
  daysLeft: z.number().min(0),
  monthlyIncome: z.number().min(0),
  totalSpent: z.number().min(0),
})

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const validation = await validateRequest(request, goalSummarySchema)
    if (!validation.success) {
      return validation.response
    }

    const body = validation.data
    const advice = await generateAIGoalAdvice(body)

    if (!advice) {
      return NextResponse.json({ error: "AI unavailable", fallback: true }, { status: 503 })
    }

    return NextResponse.json({ advice })
  } catch (error) {
    console.error("[AI Goals] Error:", error)
    return apiError("Failed to generate advice")
  }
}
