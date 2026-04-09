import { NextResponse } from "next/server"
import { generateAIInsights, type SpendingSummary } from "@/lib/ai"

export async function POST(request: Request) {
  try {
    const body = await request.json() as SpendingSummary

    if (!body.monthlyIncome || !body.totalSpent) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const insights = await generateAIInsights(body)

    if (!insights) {
      return NextResponse.json({ error: "AI unavailable", fallback: true }, { status: 503 })
    }

    return NextResponse.json({ insights })
  } catch (error) {
    console.error("[AI Insights] Error:", error)
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 })
  }
}
