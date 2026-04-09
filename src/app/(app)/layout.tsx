"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Flame, LayoutDashboard, Receipt, PieChart, Lightbulb,
  Target, Settings, LogOut, Menu, X, Bell, Sun, Moon, ShieldAlert, FileBarChart, Users,
  ChevronLeft, ChevronRight, MessageCircle, Crown
} from "lucide-react"
import { getUser, getNotifications, markAllNotificationsRead } from "@/lib/store"

const navItemsTop = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/budgets", label: "Budgets", icon: PieChart },
  { href: "/daily-roast", label: "Daily Roast", icon: Flame },
  { href: "/insights", label: "Insights", icon: Lightbulb },
]

const socialItem = { href: "/social", label: "Roast Social", icon: MessageCircle }

const navItemsBottom = [
  { href: "/leaks", label: "Money Leaks", icon: ShieldAlert },
  { href: "/report", label: "Weekly Report", icon: FileBarChart },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/settings", label: "Settings", icon: Settings },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null)
  const [notifications, setNotifications] = useState<ReturnType<typeof getNotifications>>([])
  const [showNotifs, setShowNotifs] = useState(false)
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const [socialNotifs] = useState(3) // Social notifications count

  useEffect(() => {
    const u = getUser()
    if (!u) { router.push("/onboarding"); return }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(u)
    setNotifications(getNotifications())
    const saved = localStorage.getItem("walletroast_theme") as "dark" | "light" | null
    if (saved) setTheme(saved)
    const savedCollapsed = localStorage.getItem("walletroast_sidebar_collapsed")
    if (savedCollapsed === "true") setCollapsed(true)
  }, [router, pathname])

  useEffect(() => {
    document.documentElement.className = theme === "light" ? "theme-light" : "dark"
    localStorage.setItem("walletroast_theme", theme)
  }, [theme])

  const toggleCollapsed = () => {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem("walletroast_sidebar_collapsed", String(next))
  }

  const unreadCount = notifications.filter(n => !n.readStatus).length
  if (!user) return null

  const isPro = user.subscriptionPlan === "pro"

  const roastEmoji = user.roastLevel === "soft" ? "😊" : user.roastLevel === "direct" ? "😐" : "🔥"
  const sidebarWidth = collapsed ? 72 : 260

  const renderNavItem = (item: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }) => {
    const isActive = pathname === item.href
    return (
      <Link key={item.href} href={item.href}
        title={collapsed ? item.label : undefined}
        className={`flex items-center rounded-xl text-[13px] font-medium transition-all duration-200 ${
          isActive
            ? "bg-orange-500/10 text-orange-400 border border-orange-500/15 shadow-sm"
            : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-secondary)]"
        }`}
        style={{
          gap: collapsed ? 0 : 12,
          padding: collapsed ? "10px 0" : "10px 14px",
          justifyContent: collapsed ? "center" : "flex-start",
        }}
      >
        <item.icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? "text-orange-400" : ""}`} />
        {!collapsed && (
          <span className="whitespace-nowrap overflow-hidden">{item.label}</span>
        )}
      </Link>
    )
  }

  const isSocialActive = pathname?.startsWith("/social")

  return (
    <div className="min-h-screen flex">
      {/* ─── Desktop Sidebar ─── */}
      <aside
        className="hidden lg:flex flex-col border-r border-[var(--color-border)] bg-[var(--color-card)]/80 backdrop-blur-2xl fixed inset-y-0 left-0 z-40"
        style={{
          width: sidebarWidth,
          transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 h-16 border-b border-[var(--color-border)]"
          style={{ padding: collapsed ? "0 16px" : "0 24px", justifyContent: collapsed ? "center" : "flex-start" }}>
          <div className="w-8 h-8 rounded-xl bg-[#111113] flex items-center justify-center shrink-0 shadow-md">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.5 7 4 9.5 4 14a8 8 0 0016 0c0-4.5-4.5-7-8-12z" fill="url(#flame-g)"/><path d="M12 9c-1.5 2.5-4 4-4 6.5a4 4 0 008 0c0-2.5-2.5-4-4-6.5z" fill="#111113"/><path d="M12 13c-.75 1.25-2 2-2 3.25a2 2 0 004 0c0-1.25-1.25-2-2-3.25z" fill="url(#flame-g2)"/><defs><linearGradient id="flame-g" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse"><stop stopColor="#ef4444"/><stop offset="1" stopColor="#f97316"/></linearGradient><linearGradient id="flame-g2" x1="12" y1="13" x2="12" y2="18" gradientUnits="userSpaceOnUse"><stop stopColor="#fbbf24"/><stop offset="1" stopColor="#f97316"/></linearGradient></defs></svg>
          </div>
          {!collapsed && (
            <span className="text-base font-bold tracking-tight whitespace-nowrap overflow-hidden">WalletRoast</span>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-5 space-y-1" style={{ padding: collapsed ? "20px 12px" : "20px 12px" }}>
          {navItemsTop.map(renderNavItem)}

          {/* ─── Roast Social (Special) ─── */}
          <div style={{ padding: collapsed ? "8px 0" : "8px 0" }}>
            <Link href={socialItem.href}
              title={collapsed ? socialItem.label : undefined}
              className={`relative flex items-center rounded-xl text-[13px] font-semibold transition-all duration-200 ${
                isSocialActive
                  ? "bg-gradient-to-r from-orange-500/20 to-red-500/15 text-orange-300 border border-orange-500/25 shadow-md shadow-orange-500/10"
                  : "bg-gradient-to-r from-orange-500/8 to-red-500/5 text-orange-400 border border-orange-500/10 hover:from-orange-500/15 hover:to-red-500/10 hover:border-orange-500/20 hover:shadow-md hover:shadow-orange-500/5"
              }`}
              style={{
                gap: collapsed ? 0 : 10,
                padding: collapsed ? "11px 0" : "11px 14px",
                justifyContent: collapsed ? "center" : "flex-start",
              }}
            >
              <div className="relative shrink-0">
                <MessageCircle className={`w-[18px] h-[18px] ${isSocialActive ? "text-orange-300" : "text-orange-400"}`} />
                {socialNotifs > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full text-[9px] flex items-center justify-center font-bold text-white shadow-sm animate-pulse">
                    {socialNotifs}
                  </span>
                )}
              </div>
              {!collapsed && (
                <>
                  <span className="whitespace-nowrap overflow-hidden flex-1">🔥 Roast Social</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0" />
                </>
              )}
            </Link>
          </div>

          {navItemsBottom.map(renderNavItem)}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-[var(--color-border)]" style={{ padding: collapsed ? "12px 8px" : "12px 16px" }}>
          <div className="flex items-center" style={{
            gap: collapsed ? 0 : 10,
            justifyContent: collapsed ? "center" : "flex-start",
          }}>
            {/* ─── Profile Avatar with Pro Badge ─── */}
            <div className="relative shrink-0">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white overflow-hidden ${
                isPro
                  ? "ring-2 ring-amber-400 shadow-lg shadow-amber-500/30"
                  : "shadow-md shadow-orange-500/20"
              }`}
                style={{
                  background: isPro
                    ? "linear-gradient(135deg, #f59e0b, #d97706)"
                    : "linear-gradient(135deg, #f97316, #ea580c)"
                }}
              >
                {user.profilePhoto ? (
                  <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name?.charAt(0).toUpperCase() || "U"
                )}
              </div>
              {/* Pro Crown */}
              {isPro && (
                <div className="absolute -top-2 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-sm shadow-amber-500/40 animate-pulse" style={{ animationDuration: "3s" }}>
                  <Crown className="w-3 h-3 text-amber-900" />
                </div>
              )}
              {/* Roast level badge (free users) */}
              {!isPro && (
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] flex items-center justify-center text-[8px]">
                  {roastEmoji}
                </div>
              )}
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[13px] font-semibold truncate">{user.name}</p>
                    {isPro && (
                      <span className="px-1.5 py-0.5 rounded-md text-[8px] font-black tracking-wider bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-900 leading-none uppercase shadow-sm">PRO</span>
                    )}
                  </div>
                  <p className="text-[11px] text-[var(--color-muted-foreground)] truncate flex items-center gap-1">
                    {roastEmoji} {user.roastLevel.charAt(0).toUpperCase() + user.roastLevel.slice(1)} mode
                  </p>
                </div>
                <button onClick={() => { localStorage.clear(); router.push("/") }}
                  title="Sign Out"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-500/5 transition-all shrink-0">
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
            {collapsed && (
              <button onClick={() => { localStorage.clear(); router.push("/") }}
                title="Sign Out"
                className="absolute bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-500/5 transition-all">
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ─── Collapse Toggle Arrow ─── */}
        <button
          onClick={toggleCollapsed}
          className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] hover:border-orange-500/40 hover:bg-orange-500/10 flex items-center justify-center transition-all duration-200 shadow-lg z-50 group"
          style={{ right: -12 }}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed
            ? <ChevronRight className="w-3.5 h-3.5 text-[var(--color-muted-foreground)] group-hover:text-orange-400 transition-colors" />
            : <ChevronLeft className="w-3.5 h-3.5 text-[var(--color-muted-foreground)] group-hover:text-orange-400 transition-colors" />
          }
        </button>
      </aside>

      {/* ─── Mobile Header ─── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 border-b border-[var(--color-border)] bg-[var(--color-card)]/90 backdrop-blur-2xl flex items-center justify-between px-4">
        <button onClick={() => setSidebarOpen(true)} className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]">
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
            <Flame className="w-3 h-3 text-white" />
          </div>
          <span className="font-bold text-sm">WalletRoast</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="text-[var(--color-muted-foreground)]">
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button onClick={() => setShowNotifs(!showNotifs)} className="relative text-[var(--color-muted-foreground)]">
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-[9px] flex items-center justify-center font-bold">{unreadCount}</span>
            )}
          </button>
        </div>
      </div>

      {/* ─── Mobile Sidebar Overlay ─── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setSidebarOpen(false)} />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", damping: 30, stiffness: 350 }}
              className="lg:hidden fixed inset-y-0 left-0 w-72 bg-[var(--color-card)] border-r border-[var(--color-border)] z-50"
            >
              <div className="flex items-center justify-between px-5 h-14 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                    <Flame className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="font-bold text-sm">WalletRoast</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="text-[var(--color-muted-foreground)]"><X className="w-5 h-5" /></button>
              </div>
              <nav className="px-3 py-4 space-y-1">
                {navItemsTop.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                        isActive ? "bg-orange-500/10 text-orange-400" : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-secondary)]"
                      }`}>
                      <item.icon className="w-[18px] h-[18px]" />{item.label}
                    </Link>
                  )
                })}
                <div className="py-1">
                  <Link href="/social" onClick={() => setSidebarOpen(false)}
                    className={`relative flex items-center gap-3 px-3.5 py-3 rounded-xl text-[13px] font-semibold transition-all ${
                      isSocialActive
                        ? "bg-gradient-to-r from-orange-500/20 to-red-500/15 text-orange-300 border border-orange-500/25"
                        : "bg-gradient-to-r from-orange-500/8 to-red-500/5 text-orange-400 border border-orange-500/10"
                    }`}>
                    <div className="relative">
                      <MessageCircle className="w-[18px] h-[18px]" />
                      {socialNotifs > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full text-[9px] flex items-center justify-center font-bold text-white animate-pulse">
                          {socialNotifs}
                        </span>
                      )}
                    </div>
                    🔥 Roast Social
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  </Link>
                </div>
                {navItemsBottom.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                        isActive ? "bg-orange-500/10 text-orange-400" : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-secondary)]"
                      }`}>
                      <item.icon className="w-[18px] h-[18px]" />{item.label}
                    </Link>
                  )
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ─── Notification Dropdown ─── */}
      <AnimatePresence>
        {showNotifs && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="fixed top-14 right-3 w-80 max-h-96 overflow-y-auto glass-card rounded-2xl z-50 border border-[var(--color-border)] shadow-xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
                <h3 className="font-bold text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={() => { markAllNotificationsRead(); setNotifications(getNotifications()) }}
                    className="text-xs text-orange-400 hover:text-orange-300 font-medium">Mark all read</button>
                )}
              </div>
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-[var(--color-muted-foreground)] text-sm">No notifications yet</div>
              ) : (
                notifications.slice(0, 10).map(n => (
                  <div key={n.id} className={`p-4 border-b border-[var(--color-border)]/50 ${!n.readStatus ? "bg-orange-500/[0.03]" : ""}`}>
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-[var(--color-muted-foreground)] mt-1">{n.body}</p>
                  </div>
                ))
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Main Content ─── */}
      <main
        className="flex-1 pt-14 lg:pt-0 min-h-screen"
        style={{
          marginLeft: 0,
        }}
      >
        <div
          className="hidden lg:block"
          style={{
            marginLeft: sidebarWidth,
            transition: "margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <div className="p-5 sm:p-7 lg:p-9 max-w-6xl mx-auto">
            {children}
          </div>
        </div>
        <div className="lg:hidden overflow-x-hidden">
          <div className="p-4 sm:p-7 lg:p-9 max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
