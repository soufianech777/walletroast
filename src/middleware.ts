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
const isAuthRoute = createRouteMatcher([
  "/login(.*)",
  "/register(.*)",
  "/forgot-password(.*)",
  "/reset-password(.*)",
])

// ─── Blocked paths that should NEVER be accessible ───
const BLOCKED_PATHS = [
  "/.env", "/.git", "/.svn", "/wp-admin", "/wp-login", "/wp-content",
  "/xmlrpc.php", "/phpmyadmin", "/administrator", "/.htaccess", "/.htpasswd",
  "/config.php", "/wp-config", "/server-status", "/server-info",
  "/.well-known/security.txt", "/cgi-bin", "/debug", "/.DS_Store",
  "/Thumbs.db", "/web.config", "/backup", "/dump", "/sql",
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
  /union\s+select/i,   // SQL injection
  /or\s+1\s*=\s*1/i,   // SQL injection
  /;\s*drop\s+table/i, // SQL injection
  /eval\s*\(/i,        // Code injection
  /base64/i,           // Base64 injection attempts
]

// ═══════════════════════════════════════════════════════
// BRUTE-FORCE PROTECTION SYSTEM
// ═══════════════════════════════════════════════════════

interface BruteForceEntry {
  attempts: number       // Number of attempts in current window
  firstAttempt: number   // Timestamp of first attempt
  lockoutUntil: number   // Timestamp when lockout expires (0 = not locked)
  totalBans: number      // How many times this IP has been banned (escalation)
}

// Auth route brute-force tracker (login, register, forgot-password)
const bruteForceMap = new Map<string, BruteForceEntry>()

// Config
const AUTH_MAX_ATTEMPTS = 5         // Max attempts before lockout
const AUTH_WINDOW_MS = 60_000       // 1 minute window
const BASE_LOCKOUT_MS = 60_000      // 1 minute base lockout
const MAX_LOCKOUT_MS = 3_600_000    // 1 hour max lockout
const PERMANENT_BAN_THRESHOLD = 10  // After 10 bans → 24hr ban

function getBruteForceEntry(ip: string): BruteForceEntry {
  const existing = bruteForceMap.get(ip)
  if (existing) return existing
  const entry: BruteForceEntry = { attempts: 0, firstAttempt: 0, lockoutUntil: 0, totalBans: 0 }
  bruteForceMap.set(ip, entry)
  return entry
}

function checkBruteForce(ip: string): { blocked: boolean; retryAfter: number; message: string } {
  const now = Date.now()
  const entry = getBruteForceEntry(ip)

  // Check if currently locked out
  if (entry.lockoutUntil > now) {
    const retryAfter = Math.ceil((entry.lockoutUntil - now) / 1000)
    return {
      blocked: true,
      retryAfter,
      message: `Too many attempts. Try again in ${formatTime(retryAfter)}.`,
    }
  }

  // Reset window if expired
  if (entry.firstAttempt > 0 && now - entry.firstAttempt > AUTH_WINDOW_MS) {
    entry.attempts = 0
    entry.firstAttempt = 0
  }

  // Track attempt
  if (entry.attempts === 0) {
    entry.firstAttempt = now
  }
  entry.attempts++

  // Check if exceeded
  if (entry.attempts > AUTH_MAX_ATTEMPTS) {
    entry.totalBans++

    // Progressive lockout: doubles each time, caps at MAX_LOCKOUT_MS
    // After PERMANENT_BAN_THRESHOLD bans → 24 hour ban
    let lockoutMs: number
    if (entry.totalBans >= PERMANENT_BAN_THRESHOLD) {
      lockoutMs = 24 * 60 * 60 * 1000 // 24 hours
    } else {
      lockoutMs = Math.min(
        BASE_LOCKOUT_MS * Math.pow(2, entry.totalBans - 1),
        MAX_LOCKOUT_MS
      )
    }

    entry.lockoutUntil = now + lockoutMs
    entry.attempts = 0
    entry.firstAttempt = 0

    const retryAfter = Math.ceil(lockoutMs / 1000)
    return {
      blocked: true,
      retryAfter,
      message: `Account locked for ${formatTime(retryAfter)} due to too many attempts.`,
    }
  }

  const remaining = AUTH_MAX_ATTEMPTS - entry.attempts
  return { blocked: false, retryAfter: 0, message: `${remaining} attempts remaining` }
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds} seconds`
  if (seconds < 3600) return `${Math.ceil(seconds / 60)} minutes`
  return `${Math.ceil(seconds / 3600)} hours`
}

// ═══════════════════════════════════════════════════════
// SUSPICIOUS BEHAVIOR TRACKER
// ═══════════════════════════════════════════════════════

interface SuspiciousEntry {
  blockedHits: number    // How many blocked paths this IP has hit
  suspiciousHits: number // How many suspicious patterns detected
  firstHit: number       // Timestamp
  banned: boolean        // Permanently banned this session
}

const suspiciousMap = new Map<string, SuspiciousEntry>()
const SUSPICIOUS_THRESHOLD = 5     // 5 bad requests → auto-ban
const SUSPICIOUS_WINDOW_MS = 300_000 // 5 minute window

function trackSuspicious(ip: string, type: "blocked" | "pattern"): boolean {
  const now = Date.now()
  let entry = suspiciousMap.get(ip)

  if (!entry || now - entry.firstHit > SUSPICIOUS_WINDOW_MS) {
    entry = { blockedHits: 0, suspiciousHits: 0, firstHit: now, banned: false }
    suspiciousMap.set(ip, entry)
  }

  if (entry.banned) return true

  if (type === "blocked") entry.blockedHits++
  if (type === "pattern") entry.suspiciousHits++

  const totalBad = entry.blockedHits + entry.suspiciousHits
  if (totalBad >= SUSPICIOUS_THRESHOLD) {
    entry.banned = true
    return true // Ban this IP
  }

  return false
}

function isIPBanned(ip: string): boolean {
  const entry = suspiciousMap.get(ip)
  return entry?.banned === true
}

// ─── Security Headers ───
function applySecurityHeaders(response: NextResponse, isAuth: boolean = false) {
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://www.googletagmanager.com https://www.google-analytics.com https://va.vercel-scripts.com https://*.clerk.accounts.dev https://challenges.cloudflare.com",
    "worker-src 'self' blob:",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https: http:",
    "connect-src 'self' https://www.google-analytics.com https://vitals.vercel-insights.com https://*.clerk.accounts.dev https://api.clerk.dev https://*.clerk.com",
    "frame-src 'self' https://*.clerk.accounts.dev https://challenges.cloudflare.com https://accounts.google.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self' https://*.clerk.accounts.dev https://accounts.google.com",
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
  response.headers.set("X-Robots-Tag", "index, follow")

  // Extra headers for auth pages — prevent caching of login/register
  if (isAuth) {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, private")
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")
  }

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

// Clean up all maps every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now()
    // Clean rate limit entries
    for (const [key, value] of rateLimitMap) {
      if (now > value.resetTime) rateLimitMap.delete(key)
    }
    // Clean brute force entries (keep banned ones for 24h)
    for (const [key, value] of bruteForceMap) {
      if (value.lockoutUntil > 0 && now > value.lockoutUntil && value.totalBans < PERMANENT_BAN_THRESHOLD) {
        bruteForceMap.delete(key)
      }
    }
    // Clean suspicious entries (keep bans for 1 hour)
    for (const [key, value] of suspiciousMap) {
      if (!value.banned && now - value.firstHit > SUSPICIOUS_WINDOW_MS) {
        suspiciousMap.delete(key)
      }
      if (value.banned && now - value.firstHit > 3_600_000) {
        suspiciousMap.delete(key)
      }
    }
  }, 300_000)
}

// ─── Block bots scanning for vulnerabilities ───
function isBlockedBot(userAgent: string): boolean {
  const blockedBots = [
    "sqlmap", "nikto", "dirbuster", "gobuster", "wfuzz", "nmap",
    "masscan", "zgrab", "nuclei", "httpx", "subfinder", "whatweb",
    "wpscan", "joomscan", "acunetix", "nessus", "burp", "hydra",
    "medusa", "john", "hashcat", "metasploit", "openvas",
    "scrapy", "wget/1", "python-requests", "go-http-client",
  ]
  const ua = userAgent.toLowerCase()
  return blockedBots.some(bot => ua.includes(bot))
}

// ─── 403 Forbidden response ───
function forbidden(message: string = "Forbidden") {
  return new NextResponse(
    JSON.stringify({ error: message }),
    { status: 403, headers: { "Content-Type": "application/json" } }
  )
}

// ─── 429 Too Many Requests ───
function tooManyRequests(message: string, retryAfter: number, html: boolean = false) {
  if (html) {
    return new NextResponse(
      `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Slow Down</title>
      <style>body{font-family:system-ui;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#050507;color:#fff}
      .c{text-align:center;max-width:400px;padding:2rem}.e{font-size:3rem;margin-bottom:1rem}
      h1{font-size:1.5rem;margin-bottom:.5rem}p{color:#71717a;font-size:.875rem;line-height:1.6}
      .t{color:#f97316;font-weight:bold;font-size:1.25rem;margin-top:1rem}</style></head>
      <body><div class="c"><div class="e">🛑</div><h1>Too Many Requests</h1>
      <p>${message}</p><div class="t">Retry in ${retryAfter}s</div></div></body></html>`,
      {
        status: 429,
        headers: {
          "Content-Type": "text/html",
          "Retry-After": String(retryAfter),
          "Cache-Control": "no-store",
        },
      }
    )
  }
  return new NextResponse(
    JSON.stringify({ error: message }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfter),
      },
    }
  )
}

// ═══════════════════════════════════════════════════════
// MAIN MIDDLEWARE
// ═══════════════════════════════════════════════════════

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { pathname } = req.nextUrl
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  const userAgent = req.headers.get("user-agent") || ""

  // ─── 0. Check if IP is already banned ───
  if (isIPBanned(ip)) {
    return forbidden("Your access has been temporarily restricted.")
  }

  // ─── 1. Block vulnerability scanners & cracking tools ───
  if (isBlockedBot(userAgent)) {
    trackSuspicious(ip, "blocked")
    return forbidden()
  }

  // ─── 2. Block empty user-agents (likely bots/scripts) ───
  if (!userAgent || userAgent.length < 10) {
    trackSuspicious(ip, "blocked")
    return forbidden()
  }

  // ─── 3. Block known bad paths (honeypot) ───
  const lowerPath = pathname.toLowerCase()
  if (BLOCKED_PATHS.some(blocked => lowerPath.startsWith(blocked))) {
    const shouldBan = trackSuspicious(ip, "blocked")
    if (shouldBan) return forbidden("Your access has been temporarily restricted.")
    return new NextResponse("Not Found", { status: 404 })
  }

  // ─── 4. Check for suspicious URL patterns (SQLi, XSS, traversal) ───
  const fullUrl = req.nextUrl.toString()
  if (SUSPICIOUS_PATTERNS.some(pattern => pattern.test(pathname) || pattern.test(fullUrl))) {
    const shouldBan = trackSuspicious(ip, "pattern")
    if (shouldBan) return forbidden("Your access has been temporarily restricted.")
    return new NextResponse("Bad Request", { status: 400 })
  }

  // ─── 5. BRUTE-FORCE PROTECTION on auth routes ───
  if (isAuthRoute(req)) {
    const bruteCheck = checkBruteForce(ip)
    if (bruteCheck.blocked) {
      return tooManyRequests(bruteCheck.message, bruteCheck.retryAfter, true)
    }
  }

  // ─── 6. Rate limit API routes (strict) ───
  if (isApiRoute(req)) {
    if (isRateLimited(ip, API_RATE_LIMIT)) {
      return tooManyRequests("Too many requests. Please try again later.", 1)
    }

    // Validate Origin (CORS-like protection)
    const origin = req.headers.get("origin")
    const allowedOrigins = [
      "https://walletroast.com",
      "https://www.walletroast.com",
      ...(process.env.NODE_ENV === "development" ? ["http://localhost:3000"] : []),
    ]

    if (origin && !allowedOrigins.includes(origin)) {
      return forbidden("Cross-origin request blocked.")
    }
  }

  // ─── 7. Rate limit page routes (lenient) ───
  if (!isApiRoute(req) && !isAuthRoute(req) && isRateLimited(ip, PAGE_RATE_LIMIT)) {
    return tooManyRequests("Please slow down and try again.", 2, true)
  }

  // ─── 8. Protect authenticated routes ───
  if (isProtectedRoute(req)) {
    await auth.protect()
  }

  // ─── 9. Protect admin routes ───
  if (isAdminRoute(req)) {
    const session = await auth()
    const metadata = session?.sessionClaims?.metadata as Record<string, unknown> | undefined

    if (metadata?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  // ─── 10. Apply security headers ───
  const response = NextResponse.next()
  return applySecurityHeaders(response, isAuthRoute(req))
})

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}
