import { NextResponse } from "next/server"
import { generateAIRoast, type SpendingSummary } from "@/lib/ai"

export async function POST(request: Request) {
  try {
    const body = await request.json() as SpendingSummary

    if (!body.monthlyIncome || !body.totalSpent) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const roast = await generateAIRoast(body)

    if (!roast) {
      return NextResponse.json({ error: "AI unavailable", fallback: true }, { status: 503 })
    }

    return NextResponse.json({ roast })
  } catch (error) {
    console.error("[AI Roast] Error:", error)
    return NextResponse.json({ error: "Failed to generate roast" }, { status: 500 })
  }
}
