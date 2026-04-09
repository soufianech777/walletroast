import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// ─── Protected Routes ───
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/expenses(.*)",
  "/budgets(.*)",
  "/goals(.*)",
  "/insights(.*)",
  "/settings(.*)",
  "/social(.*)",
  "/daily-roast(.*)",
  "/leaks(.*)",
  "/notifications(.*)",
  "/report(.*)",
])

const isAdminRoute = createRouteMatcher(["/admin(.*)"])

const isApiRoute = createRouteMatcher(["/api(.*)"])

// ─── Security Headers ───
function applySecurityHeaders(response: NextResponse) {
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://va.vercel-scripts.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https: http:",
    "connect-src 'self' https://www.google-analytics.com https://vitals.vercel-insights.com https://*.clerk.accounts.dev https://api.clerk.dev",
    "frame-src 'self' https://*.clerk.accounts.dev",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join("; ")

  response.headers.set("Content-Security-Policy", csp)
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  )

  return response
}

// ─── Rate Limiter (in-memory, per-IP) ───
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 10 // requests per window
const RATE_WINDOW = 1000 // 1 second

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW })
    return false
  }

  entry.count++
  if (entry.count > RATE_LIMIT) {
    return true
  }

  return false
}

// Clean up old entries every 60 seconds
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now()
    for (const [key, value] of rateLimitMap) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key)
      }
    }
  }, 60000)
}

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const response = NextResponse.next()
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"

  // ─── Rate limit API routes ───
  if (isApiRoute(req)) {
    if (isRateLimited(ip)) {
      return new NextResponse(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "1",
          },
        }
      )
    }
  }

  // ─── Protect authenticated routes ───
  if (isProtectedRoute(req)) {
    await auth.protect()
  }

  // ─── Protect admin routes ───
  if (isAdminRoute(req)) {
    const session = await auth()
    const role = session?.sessionClaims?.metadata?.role as string | undefined

    if (role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  // ─── Apply security headers ───
  return applySecurityHeaders(response)
})

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}
