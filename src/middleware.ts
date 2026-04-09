import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// ─── Protected Routes (require authentication) ───
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

// ─── Blocked paths that should NEVER be accessible ───
const BLOCKED_PATHS = [
  "/.env",
  "/.git",
  "/.svn",
  "/wp-admin",
  "/wp-login",
  "/wp-content",
  "/xmlrpc.php",
  "/phpmyadmin",
  "/administrator",
  "/.htaccess",
  "/.htpasswd",
  "/config.php",
  "/wp-config",
  "/server-status",
  "/server-info",
  "/.well-known/security.txt",
  "/cgi-bin",
  "/debug",
  "/.DS_Store",
  "/Thumbs.db",
  "/web.config",
]

// ─── Suspicious patterns in URLs ───
const SUSPICIOUS_PATTERNS = [
  /\.\.\//,            // Path traversal
  /\/\.\//,            // Dot segments
  /<script/i,          // XSS attempts
  /javascript:/i,      // JS injection
  /\0/,                // Null bytes
  /%(00|25|2e|2f)/i,   // Encoded traversals
  /\.(sql|bak|backup|old|orig|save|swp|tmp)$/i, // Sensitive file extensions
]

// ─── Security Headers ───
function applySecurityHeaders(response: NextResponse) {
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
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()")
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  )
  // Prevent search engines from indexing API routes
  response.headers.set("X-Robots-Tag", "noindex, nofollow")

  return response
}

// ─── Rate Limiter (in-memory, per-IP) ───
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const API_RATE_LIMIT = 10   // 10 requests per second for API
const PAGE_RATE_LIMIT = 30  // 30 requests per second for pages
const RATE_WINDOW = 1000    // 1 second

function isRateLimited(ip: string, limit: number): boolean {
  const now = Date.now()
  const key = `${ip}:${limit}`
  const entry = rateLimitMap.get(key)

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_WINDOW })
    return false
  }

  entry.count++
  return entry.count > limit
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

// ─── Block bots scanning for vulnerabilities ───
function isBlockedBot(userAgent: string): boolean {
  const blockedBots = [
    "sqlmap",
    "nikto",
    "dirbuster",
    "gobuster",
    "wfuzz",
    "nmap",
    "masscan",
    "zgrab",
    "nuclei",
    "httpx",
    "subfinder",
    "whatweb",
    "wpscan",
    "joomscan",
    "acunetix",
    "nessus",
    "burp",
  ]
  const ua = userAgent.toLowerCase()
  return blockedBots.some(bot => ua.includes(bot))
}

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { pathname } = req.nextUrl
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  const userAgent = req.headers.get("user-agent") || ""

  // ─── 1. Block vulnerability scanners ───
  if (isBlockedBot(userAgent)) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  // ─── 2. Block known bad paths (honeypot) ───
  const lowerPath = pathname.toLowerCase()
  if (BLOCKED_PATHS.some(blocked => lowerPath.startsWith(blocked))) {
    return new NextResponse("Not Found", { status: 404 })
  }

  // ─── 3. Check for suspicious URL patterns ───
  if (SUSPICIOUS_PATTERNS.some(pattern => pattern.test(pathname))) {
    return new NextResponse("Bad Request", { status: 400 })
  }

  // ─── 4. Rate limit API routes (stricter) ───
  if (isApiRoute(req)) {
    if (isRateLimited(ip, API_RATE_LIMIT)) {
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

    // Validate Origin for API routes (CORS-like protection)
    const origin = req.headers.get("origin")
    const allowedOrigins = [
      "https://walletroast.com",
      "https://www.walletroast.com",
      ...(process.env.NODE_ENV === "development" ? ["http://localhost:3000"] : []),
    ]

    if (origin && !allowedOrigins.includes(origin)) {
      return new NextResponse(
        JSON.stringify({ error: "Forbidden" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      )
    }
  }

  // ─── 5. Rate limit page routes (more lenient) ───
  if (!isApiRoute(req) && isRateLimited(ip, PAGE_RATE_LIMIT)) {
    return new NextResponse(
      "<html><body><h1>Too Many Requests</h1><p>Please slow down and try again.</p></body></html>",
      {
        status: 429,
        headers: { "Content-Type": "text/html", "Retry-After": "2" },
      }
    )
  }

  // ─── 6. Protect authenticated routes ───
  if (isProtectedRoute(req)) {
    await auth.protect()
  }

  // ─── 7. Protect admin routes ───
  if (isAdminRoute(req)) {
    const session = await auth()
    const role = session?.sessionClaims?.metadata?.role as string | undefined

    if (role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  // ─── 8. Apply security headers to all responses ───
  const response = NextResponse.next()
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
