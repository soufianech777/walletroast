import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

/**
 * Require authentication — redirects to /login if not logged in.
 * Use in Server Components or Route Handlers.
 */
export async function requireAuth() {
  const session = await auth()

  if (!session?.userId) {
    redirect("/login")
  }

  return session
}

/**
 * Require admin role — redirects to /dashboard if not admin.
 */
export async function requireAdmin() {
  const session = await auth()

  if (!session?.userId) {
    redirect("/login")
  }

  const metadata = session?.sessionClaims?.metadata as Record<string, unknown> | undefined
  if (metadata?.role !== "admin") {
    redirect("/dashboard")
  }

  return session
}

/**
 * Get current user with full profile data.
 */
export async function getCurrentUser() {
  const user = await currentUser()

  if (!user) {
    return null
  }

  return {
    id: user.id,
    email: user.emailAddresses[0]?.emailAddress ?? "",
    firstName: user.firstName,
    lastName: user.lastName,
    imageUrl: user.imageUrl,
    role: (user.publicMetadata?.role as string) ?? "user",
    createdAt: user.createdAt,
  }
}

/**
 * Check if current user is admin.
 */
export async function isAdmin(): Promise<boolean> {
  const session = await auth()
  const metadata = session?.sessionClaims?.metadata as Record<string, unknown> | undefined
  return metadata?.role === "admin"
}
