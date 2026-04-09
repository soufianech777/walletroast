import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Required for static export (APK builds)
export const dynamic = "force-static"

/**
 * Health check endpoint — returns minimal info.
 * Does NOT expose version, environment, or internal details.
 */
export async function GET(request: NextRequest) {
  // Only allow health checks from trusted sources
  const userAgent = request.headers.get("user-agent") || ""

  // Block direct browser access in production — health checks are for monitoring tools
  const isMonitoringTool =
    userAgent.includes("UptimeRobot") ||
    userAgent.includes("Pingdom") ||
    userAgent.includes("curl") ||
    userAgent.includes("Vercel") ||
    userAgent.includes("node-fetch") ||
    process.env.NODE_ENV === "development"

  if (!isMonitoringTool) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404 }
    )
  }

  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-Robots-Tag": "noindex, nofollow",
      },
    }
  )
}

// Block all other methods
export async function POST() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}
export async function PUT() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}
export async function DELETE() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}
