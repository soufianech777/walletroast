"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bell, BellOff, Flame, DollarSign, TrendingDown, ShieldAlert,
  Target, Trophy, MessageCircle, Settings, Check, CheckCheck,
  Trash2, Filter, Clock
} from "lucide-react"
import { getUser } from "@/lib/store"

type NotifType = "roast" | "budget" | "social" | "achievement" | "alert" | "tip"

interface Notification {
  id: string
  type: NotifType
  title: string
  message: string
  time: string
  read: boolean
  emoji?: string
}

const iconMap: Record<NotifType, { icon: typeof Bell; color: string; bg: string }> = {
  roast: { icon: Flame, color: "text-orange-400", bg: "bg-orange-500/10" },
  budget: { icon: DollarSign, color: "text-red-400", bg: "bg-red-500/10" },
  social: { icon: MessageCircle, color: "text-blue-400", bg: "bg-blue-500/10" },
  achievement: { icon: Trophy, color: "text-amber-400", bg: "bg-amber-500/10" },
  alert: { icon: ShieldAlert, color: "text-red-400", bg: "bg-red-500/10" },
  tip: { icon: Target, color: "text-emerald-400", bg: "bg-emerald-500/10" },
}

const demoNotifications: Notification[] = [
  { id: "1", type: "roast", title: "🔥 Daily Roast Ready!", message: "Your personalized roast for today has landed. It's spicy.", time: "Just now", read: false, emoji: "🔥" },
  { id: "2", type: "budget", title: "Budget Alert: Food", message: "You've used 87% of your food budget and it's only the 15th. Slow down!", time: "5 min ago", read: false, emoji: "🍔" },
  { id: "3", type: "social", title: "SaveQueen roasted you!", message: "\"Your coffee budget could fund NASA\" — SaveQueen left a comment on your roast.", time: "12 min ago", read: false, emoji: "💬" },
  { id: "4", type: "achievement", title: "Achievement Unlocked!", message: "\"Penny Pincher\" — You stayed under budget for 3 consecutive days!", time: "1 hour ago", read: false, emoji: "🏆" },
  { id: "5", type: "alert", title: "Unusual Spending Detected", message: "You spent $349 on Entertainment today — that's 5x your daily average.", time: "2 hours ago", read: true, emoji: "⚠️" },
  { id: "6", type: "tip", title: "Money Saving Tip", message: "Switch to a cheaper phone plan? You could save $40/month based on your usage.", time: "3 hours ago", read: true, emoji: "💡" },
  { id: "7", type: "roast", title: "Weekly Roast Summary", message: "This week's damage: $1,423 spent. Your discipline score dropped 5 points.", time: "Yesterday", read: true, emoji: "📊" },
  { id: "8", type: "social", title: "You're trending!", message: "Your roast post got 24 reactions. You're famous for being bad with money!", time: "Yesterday", read: true, emoji: "🔝" },
  { id: "9", type: "budget", title: "Goal Progress: Emergency Fund", message: "You're 43% toward your emergency fund goal. Keep it up!", time: "2 days ago", read: true, emoji: "🎯" },
  { id: "10", type: "achievement", title: "7-Day Streak! 🔥", message: "You've logged expenses for 7 days straight. Your wallet thanks you.", time: "3 days ago", read: true, emoji: "🏅" },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(demoNotifications)
  const [filter, setFilter] = useState<"all" | NotifType>("all")
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null)
  const [pushEnabled, setPushEnabled] = useState(true)

  useEffect(() => {
    setUser(getUser())
    const saved = localStorage.getItem("walletroast_push_enabled")
    if (saved !== null) setPushEnabled(saved === "true")
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const deleteNotif = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  const togglePush = () => {
    const next = !pushEnabled
    setPushEnabled(next)
    localStorage.setItem("walletroast_push_enabled", String(next))
  }

  const filtered = filter === "all" ? notifications : notifications.filter(n => n.type === filter)

  const filters: { value: "all" | NotifType; label: string; emoji: string }[] = [
    { value: "all", label: "All", emoji: "📬" },
    { value: "roast", label: "Roasts", emoji: "🔥" },
    { value: "budget", label: "Budget", emoji: "💰" },
    { value: "social", label: "Social", emoji: "💬" },
    { value: "achievement", label: "Wins", emoji: "🏆" },
    { value: "alert", label: "Alerts", emoji: "⚠️" },
    { value: "tip", label: "Tips", emoji: "💡" },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-orange-400" />
            Notifications
          </h1>
          <p className="text-[var(--color-muted-foreground)] text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "You're all caught up!"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={togglePush}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[12px] font-semibold transition-all ${
              pushEnabled ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-[var(--color-border)] text-[var(--color-muted-foreground)]"
            }`}>
            {pushEnabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
            {pushEnabled ? "Push On" : "Push Off"}
          </button>
        </div>
      </div>

      {/* Push notification preferences */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5 rounded-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Settings className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <h3 className="text-[13px] font-bold">Notification Preferences</h3>
              <p className="text-[11px] text-[var(--color-muted-foreground)]">Choose what you want to be notified about</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { label: "Daily Roasts", emoji: "🔥", desc: "Your daily roast card", enabled: true },
            { label: "Budget Alerts", emoji: "💰", desc: "When you exceed limits", enabled: true },
            { label: "Social Activity", emoji: "💬", desc: "Comments & reactions", enabled: true },
            { label: "Achievements", emoji: "🏆", desc: "Badges & milestones", enabled: true },
            { label: "Spending Alerts", emoji: "⚠️", desc: "Unusual spending", enabled: true },
            { label: "Smart Tips", emoji: "💡", desc: "Saving suggestions", enabled: false },
          ].map((pref, i) => (
            <button key={pref.label}
              className={`p-3 rounded-xl border text-left transition-all hover:-translate-y-0.5 ${
                pref.enabled ? "border-orange-500/20 bg-orange-500/[0.04]" : "border-[var(--color-border)] bg-[var(--color-secondary)]"
              }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">{pref.emoji}</span>
                <div className={`w-7 h-4 rounded-full transition-all flex items-center ${pref.enabled ? "bg-orange-500 justify-end" : "bg-zinc-700 justify-start"}`}>
                  <div className="w-3 h-3 rounded-full bg-white mx-0.5" />
                </div>
              </div>
              <p className="text-[11px] font-bold">{pref.label}</p>
              <p className="text-[9px] text-[var(--color-muted-foreground)]">{pref.desc}</p>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Filters + Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {filters.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                filter === f.value ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] border border-transparent"
              }`}>
              {f.emoji} {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {unreadCount > 0 && (
            <button onClick={markAllRead}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-[var(--color-muted-foreground)] hover:text-emerald-400 transition-colors">
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button onClick={clearAll}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-[var(--color-muted-foreground)] hover:text-red-400 transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> Clear all
            </button>
          )}
        </div>
      </div>

      {/* Notification List */}
      <div className="space-y-2">
        <AnimatePresence>
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-12 rounded-2xl text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-secondary)] flex items-center justify-center mx-auto mb-4">
                <Bell className="w-7 h-7 text-[var(--color-muted-foreground)]" />
              </div>
              <h3 className="font-bold text-[15px] mb-1">No notifications</h3>
              <p className="text-[13px] text-[var(--color-muted-foreground)]">
                {filter === "all" ? "You're all caught up! Check back later." : `No ${filter} notifications right now.`}
              </p>
            </motion.div>
          ) : (
            filtered.map((notif, i) => {
              const conf = iconMap[notif.type]
              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50, height: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  onClick={() => markRead(notif.id)}
                  className={`group flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                    notif.read
                      ? "border-[var(--color-border)] bg-[var(--color-background)] hover:border-[var(--color-border-hover)]"
                      : "border-orange-500/15 bg-orange-500/[0.02] hover:border-orange-500/25"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl ${conf.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                    <conf.icon className={`w-4 h-4 ${conf.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className={`text-[13px] font-bold ${notif.read ? "" : "text-[var(--color-foreground)]"}`}>
                        {notif.title}
                      </h4>
                      {!notif.read && <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />}
                    </div>
                    <p className="text-[12px] text-[var(--color-muted-foreground)] leading-relaxed line-clamp-2">{notif.message}</p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <Clock className="w-3 h-3 text-zinc-600" />
                      <span className="text-[10px] text-zinc-600">{notif.time}</span>
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); deleteNotif(notif.id) }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--color-muted-foreground)] hover:text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
