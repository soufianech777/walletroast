"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Flame, Share2, RefreshCw,
  MessageCircle, Clipboard, Check, Sparkles, TrendingDown,
  DollarSign, ExternalLink, Heart, Clock
} from "lucide-react"
import { getUser, getExpenses } from "@/lib/store"

const dailyRoasts = [
  { roast: "Your DoorDash driver knows your address better than your family does. That's not convenience — that's a lifestyle problem.", category: "Food", emoji: "🍔", severity: "brutal" },
  { roast: "You spent more on subscriptions you forgot about than on your actual savings. Netflix isn't watching itself... oh wait, it literally is.", category: "Subscriptions", emoji: "📺", severity: "brutal" },
  { roast: "Your coffee budget could fund a small village's water supply for a year. But sure, you NEED that oat milk latte.", category: "Coffee", emoji: "☕", severity: "direct" },
  { roast: "Your savings account has less personality than a blank spreadsheet. At least the spreadsheet has potential.", category: "Savings", emoji: "💀", severity: "brutal" },
  { roast: "You're treating your credit card like it's free money. Spoiler: it's the opposite of free money.", category: "Debt", emoji: "💳", severity: "direct" },
  { roast: "Your impulse purchases this week cost more than some people's rent. Maybe resist the 'Add to Cart' button?", category: "Shopping", emoji: "🛒", severity: "brutal" },
  { roast: "You have 47 streaming services and you still say 'there's nothing to watch.' There IS something to watch: your bank balance dropping.", category: "Entertainment", emoji: "🎬", severity: "direct" },
]

const motivationalQuotes = [
  "Every dollar you don't waste is a dollar working for your future.",
  "Your bank account is a reflection of your daily choices.",
  "The best time to fix your spending was yesterday. The second best is now.",
  "Stop buying things you don't need to impress people you don't like.",
]

export default function DailyRoastPage() {
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null)
  const [todayRoast, setTodayRoast] = useState(dailyRoasts[0])
  const [copied, setCopied] = useState(false)
  const [liked, setLiked] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [streak, setStreak] = useState(7)
  const [totalSpent, setTotalSpent] = useState(0)
  const [topCategory, setTopCategory] = useState("Food")
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const u = getUser()
    setUser(u)

    // Deterministic daily roast based on day
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
    setTodayRoast(dailyRoasts[dayOfYear % dailyRoasts.length])

    // Calculate stats
    const expenses = getExpenses()
    const thisMonth = expenses.filter(e => {
      const d = new Date(e.expenseDate)
      const now = new Date()
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    setTotalSpent(thisMonth.reduce((s, e) => s + e.amount, 0))

    // Find top category
    const cats: Record<string, number> = {}
    thisMonth.forEach(e => { const name = e.category?.name || e.categoryId; cats[name] = (cats[name] || 0) + e.amount })
    const top = Object.entries(cats).sort((a, b) => b[1] - a[1])[0]
    if (top) setTopCategory(top[0])

    // Streak from localStorage
    const savedStreak = localStorage.getItem("walletroast_streak")
    if (savedStreak) setStreak(Number(savedStreak))
  }, [])

  const refreshRoast = () => {
    const newIndex = Math.floor(Math.random() * dailyRoasts.length)
    setTodayRoast(dailyRoasts[newIndex])
  }

  const shareText = `🔥 Today's WalletRoast:\n\n"${todayRoast.roast}"\n\n— Get roasted at walletroast.com`

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = (platform: string) => {
    const encoded = encodeURIComponent(shareText)
    const url = encodeURIComponent("https://walletroast.com")
    const links: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encoded}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${encoded}`,
      whatsapp: `https://wa.me/?text=${encoded}`,
      telegram: `https://t.me/share/url?url=${url}&text=${encoded}`,
    }
    window.open(links[platform], "_blank", "width=600,height=400")
    setShowShareMenu(false)
  }

  const quote = motivationalQuotes[Math.floor(Date.now() / 86400000) % motivationalQuotes.length]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2.5">
            <Flame className="w-6 h-6 text-orange-400" />
            Daily Roast
          </h1>
          <p className="text-[var(--color-muted-foreground)] text-sm mt-1">Your personalized money roast — updated daily</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-[12px] font-bold text-orange-400">{streak} day streak</span>
          </div>
        </div>
      </div>

      {/* ─── Main Roast Card ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div ref={cardRef} className="relative overflow-hidden rounded-2xl border border-orange-500/20 bg-gradient-to-br from-[#0f0808] via-[#0c0c10] to-[#0a0612]">
          {/* Decorative background */}
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-orange-600/[0.06] rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-red-600/[0.04] rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 p-8 sm:p-10">
            {/* Card header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <Flame className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="text-[13px] font-bold text-white">WalletRoast</span>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Daily Roast</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                <Clock className="w-3 h-3" />
                {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </div>
            </div>

            {/* Roast emoji & category */}
            <div className="flex items-center gap-2 mb-5">
              <span className="text-4xl">{todayRoast.emoji}</span>
              <div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  todayRoast.severity === "brutal" ? "bg-red-500/15 text-red-400" : "bg-amber-500/15 text-amber-400"
                }`}>
                  {todayRoast.severity} mode
                </span>
                <p className="text-[11px] text-zinc-500 mt-1">{todayRoast.category}</p>
              </div>
            </div>

            {/* The roast */}
            <p className="text-lg sm:text-xl text-zinc-100 leading-relaxed font-medium mb-8">
              &ldquo;{todayRoast.roast}&rdquo;
            </p>

            {/* Stats row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {[
                { label: "Spent This Month", value: `$${totalSpent.toLocaleString()}`, icon: DollarSign, color: "text-red-400" },
                { label: "Top Category", value: topCategory, icon: TrendingDown, color: "text-amber-400" },
                { label: "Roast Level", value: user?.roastLevel || "direct", icon: Sparkles, color: "text-orange-400" },
              ].map(stat => (
                <div key={stat.label} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] text-center">
                  <stat.icon className={`w-4 h-4 ${stat.color} mx-auto mb-1`} />
                  <p className={`text-[14px] font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-[9px] text-zinc-600 uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Quote */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] mb-6">
              <p className="text-[12px] text-zinc-400 italic leading-relaxed">💡 {quote}</p>
            </div>

            {/* Watermark */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-600">
                <Flame className="w-3 h-3" /> walletroast.com
              </div>
              <p className="text-[10px] text-zinc-600">Get your daily roast free →</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── Action Buttons ─── */}
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={() => setLiked(!liked)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-[13px] font-semibold transition-all ${
            liked ? "border-red-500/30 bg-red-500/10 text-red-400" : "border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:border-red-500/20 hover:text-red-400"
          }`}>
          <Heart className={`w-4 h-4 ${liked ? "fill-red-400" : ""}`} /> {liked ? "Loved!" : "Love it"}
        </button>

        <button onClick={refreshRoast}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:border-orange-500/20 hover:text-orange-400 text-[13px] font-semibold transition-all">
          <RefreshCw className="w-4 h-4" /> New Roast
        </button>

        <div className="relative">
          <button onClick={() => setShowShareMenu(!showShareMenu)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl btn-primary text-[13px] font-bold">
            <Share2 className="w-4 h-4" /> Share Roast
          </button>

          <AnimatePresence>
            {showShareMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                className="absolute top-full mt-2 right-0 w-56 glass-card rounded-xl p-2 border border-[var(--color-border)] shadow-xl z-20"
              >
                <button onClick={() => handleShare("twitter")}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[12px] font-medium text-[var(--color-muted-foreground)] hover:text-sky-400 hover:bg-[var(--color-secondary)] transition-all">
                  <ExternalLink className="w-4 h-4" /> Share on X / Twitter
                </button>
                <button onClick={() => handleShare("facebook")}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[12px] font-medium text-[var(--color-muted-foreground)] hover:text-blue-400 hover:bg-[var(--color-secondary)] transition-all">
                  <ExternalLink className="w-4 h-4" /> Share on Facebook
                </button>
                <button onClick={() => handleShare("whatsapp")}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[12px] font-medium text-[var(--color-muted-foreground)] hover:text-green-400 hover:bg-[var(--color-secondary)] transition-all">
                  <MessageCircle className="w-4 h-4" /> Share on WhatsApp
                </button>
                <button onClick={() => handleShare("telegram")}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[12px] font-medium text-[var(--color-muted-foreground)] hover:text-blue-300 hover:bg-[var(--color-secondary)] transition-all">
                  <ExternalLink className="w-4 h-4" /> Share on Telegram
                </button>
                <div className="border-t border-[var(--color-border)] mt-1 pt-1">
                  <button onClick={handleCopy}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[12px] font-medium text-[var(--color-muted-foreground)] hover:text-orange-400 hover:bg-[var(--color-secondary)] transition-all">
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Clipboard className="w-4 h-4" />}
                    {copied ? "Copied!" : "Copy to Clipboard"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ─── Previous Roasts ─── */}
      <div className="glass-card p-6 rounded-2xl">
        <h2 className="font-bold text-[15px] mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-zinc-400" /> Previous Roasts
        </h2>
        <div className="space-y-3">
          {dailyRoasts.slice(0, 4).map((roast, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-[var(--color-secondary)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-all group"
            >
              <span className="text-xl shrink-0">{roast.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] text-[var(--color-foreground)] leading-relaxed line-clamp-2">&ldquo;{roast.roast}&rdquo;</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] text-[var(--color-muted-foreground)]">{roast.category}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                    roast.severity === "brutal" ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"
                  }`}>{roast.severity}</span>
                </div>
              </div>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-muted-foreground)] hover:text-orange-400">
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
