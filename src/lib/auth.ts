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

  const role = session?.sessionClaims?.metadata?.role as string | undefined
  if (role !== "admin") {
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
  const role = session?.sessionClaims?.metadata?.role as string | undefined
  return role === "admin"
}
