import { NextResponse } from "next/server"
import { generateAIGoalAdvice, type GoalSummary } from "@/lib/ai"

export async function POST(request: Request) {
  try {
    const body = await request.json() as GoalSummary

    if (!body.title || !body.targetAmount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const advice = await generateAIGoalAdvice(body)

    if (!advice) {
      return NextResponse.json({ error: "AI unavailable", fallback: true }, { status: 503 })
    }

    return NextResponse.json({ advice })
  } catch (error) {
    console.error("[AI Goals] Error:", error)
    return NextResponse.json({ error: "Failed to generate advice" }, { status: 500 })
  }
}
