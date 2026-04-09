import { getCurrentUser } from "@/lib/auth"
import { Shield } from "lucide-react"

export default async function AdminPage() {
  const user = await getCurrentUser()

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Admin Panel</h1>
            <p className="text-sm text-zinc-500">
              Logged in as {user?.email} ({user?.role})
            </p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          {[
            { label: "Environment", value: process.env.NODE_ENV || "unknown" },
            { label: "User ID", value: user?.id?.slice(0, 12) + "..." || "—" },
            { label: "Role", value: user?.role || "user" },
          ].map((item) => (
            <div key={item.label} className="glass-card rounded-xl p-5">
              <p className="text-xs text-zinc-500 mb-1">{item.label}</p>
              <p className="font-mono text-sm font-bold">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 glass-card rounded-xl p-6">
          <h2 className="font-bold mb-3">🔒 Security Status</h2>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Middleware security headers active
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Rate limiting enabled (10 req/s per IP)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              CSP headers configured
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              HSTS preload enabled
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Admin route role-guarded
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
