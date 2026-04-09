import { NextResponse } from "next/server"
import { z } from "zod"

/**
 * Sanitize string input — strips dangerous HTML/script tags.
 */
export function sanitize(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .replace(/\\/g, "&#x5C;")
}

/**
 * Deep sanitize an object — recursively strips dangerous characters from all string values.
 */
export function deepSanitize<T>(obj: T): T {
  if (typeof obj === "string") return sanitize(obj) as unknown as T
  if (Array.isArray(obj)) return obj.map(deepSanitize) as unknown as T
  if (typeof obj === "object" && obj !== null) {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj)) {
      result[sanitize(key)] = deepSanitize(value)
    }
    return result as T
  }
  return obj
}

/**
 * Validate request body against a Zod schema.
 * Returns parsed data or a 400 error response.
 */
export async function validateRequest<T extends z.ZodSchema>(
  request: Request,
  schema: T
): Promise<
  | { success: true; data: z.infer<T> }
  | { success: false; response: NextResponse }
> {
  try {
    // Limit body size (1MB max)
    const contentLength = request.headers.get("content-length")
    if (contentLength && parseInt(contentLength) > 1_000_000) {
      return {
        success: false,
        response: NextResponse.json(
          { error: "Request body too large" },
          { status: 413 }
        ),
      }
    }

    const body = await request.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return {
        success: false,
        response: NextResponse.json(
          {
            error: "Validation failed",
            // Don't expose field details in production
            ...(process.env.NODE_ENV === "development"
              ? { details: parsed.error.flatten().fieldErrors }
              : {}),
          },
          { status: 400 }
        ),
      }
    }

    return { success: true, data: parsed.data }
  } catch {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      ),
    }
  }
}

/**
 * Standard API error response — never exposes stack traces.
 */
export function apiError(message: string, status: number = 500) {
  // In production, genericize 500 errors
  const safeMessage =
    status >= 500 && process.env.NODE_ENV === "production"
      ? "Internal server error"
      : message

  return NextResponse.json({ error: safeMessage }, { status })
}

/**
 * Standard API success response.
 */
export function apiSuccess<T>(data: T, status: number = 200) {
  return NextResponse.json({ data }, { status })
}

/**
 * Validate that the request origin is trusted.
 */
export function validateOrigin(request: Request): boolean {
  const origin = request.headers.get("origin")
  const allowedOrigins = [
    "https://walletroast.com",
    "https://www.walletroast.com",
    ...(process.env.NODE_ENV === "development" ? ["http://localhost:3000"] : []),
  ]

  if (!origin) return true // Same-origin requests don't have Origin header
  return allowedOrigins.includes(origin)
}

/**
 * Check for API key in Authorization header (for protected external APIs).
 */
export function validateApiKey(request: Request): boolean {
  const apiKey = process.env.API_SECRET_KEY
  if (!apiKey) return false // DENY if no key configured (safe default)

  const authHeader = request.headers.get("authorization")
  if (!authHeader) return false

  const [scheme, token] = authHeader.split(" ")
  return scheme === "Bearer" && token === apiKey
}

/**
 * Create secure API response headers.
 */
export function secureHeaders(): Record<string, string> {
  return {
    "Cache-Control": "no-store, no-cache, must-revalidate",
    "X-Content-Type-Options": "nosniff",
    "X-Robots-Tag": "noindex, nofollow",
  }
}
