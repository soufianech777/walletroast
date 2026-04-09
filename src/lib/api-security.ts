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
    const body = await request.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return {
        success: false,
        response: NextResponse.json(
          {
            error: "Validation failed",
            details: parsed.error.flatten().fieldErrors,
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
        { error: "Invalid JSON body" },
        { status: 400 }
      ),
    }
  }
}

/**
 * Standard API error response.
 */
export function apiError(message: string, status: number = 500) {
  return NextResponse.json({ error: message }, { status })
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
    process.env.NODE_ENV === "development" ? "http://localhost:3000" : "",
  ].filter(Boolean)

  if (!origin) return true // Same-origin requests don't have Origin header
  return allowedOrigins.includes(origin)
}

/**
 * Check for API key in Authorization header (for protected external APIs).
 */
export function validateApiKey(request: Request): boolean {
  const apiKey = process.env.API_SECRET_KEY
  if (!apiKey) return true // Skip if no key configured

  const authHeader = request.headers.get("authorization")
  if (!authHeader) return false

  const [scheme, token] = authHeader.split(" ")
  return scheme === "Bearer" && token === apiKey
}
