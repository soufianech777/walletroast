"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, useInView } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import {
  Flame, TrendingDown, Zap, Shield, BarChart3, Target,
  ChevronRight, Star, Check, Menu, X, ArrowRight,
  Sparkles, Trophy, Users, MessageCircle, Sun, Moon
} from "lucide-react"

/* ─── Animated Counter ─── */
function AnimatedNumber({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    let start = 0
    const duration = 1200
    const step = (ts: number) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * value))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [isInView, value])

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>
}

/* ─── Section wrapper with reveal ─── */
function Section({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })
  return (
    <section id={id} ref={ref} className={className}>
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </section>
  )
}

const features = [
  { icon: TrendingDown, title: "Expense Tracking", desc: "Log every dollar with one tap. Quick presets. Zero friction. No excuses.", color: "from-blue-500/20 to-cyan-500/10" },
  { icon: Zap, title: "Brutal Insights", desc: "AI-powered feedback that tells you exactly what's wrong with your spending.", color: "from-orange-500/20 to-red-500/10" },
  { icon: Shield, title: "Discipline Score", desc: "A score from 0–100 that measures your real financial discipline. No hiding.", color: "from-emerald-500/20 to-green-500/10" },
  { icon: BarChart3, title: "Budget Control", desc: "Set limits per category. Get warnings before you blow through them.", color: "from-orange-500/20 to-amber-500/10" },
  { icon: Target, title: "Smart Goals", desc: "Set savings targets with deadlines. Get roasted if you fall behind.", color: "from-pink-500/20 to-rose-500/10" },
  { icon: Flame, title: "Roast Mode", desc: "Choose your intensity: Soft, Direct, or Brutal. Your money, your therapy.", color: "from-amber-500/20 to-orange-500/10" },
]

const roastCards = [
  {
    level: "Soft", emoji: "😊", color: "border-sky-500/30", bg: "bg-sky-500/5",
    accent: "text-sky-400", glow: "hover:shadow-sky-500/10",
    message: "You're spending a bit more than planned on food. Maybe try cooking at home a few times this week?"
  },
  {
    level: "Direct", emoji: "😐", color: "border-amber-500/30", bg: "bg-amber-500/5",
    accent: "text-amber-400", glow: "hover:shadow-amber-500/10",
    message: "You're 40% over your food budget. Cut delivery apps. Cook at home. Fix it this week."
  },
  {
    level: "Brutal", emoji: "🔥", color: "border-red-500/30", bg: "bg-red-500/5",
    accent: "text-red-400", glow: "hover:shadow-red-500/10",
    message: "Your kitchen is a museum. $800 on food this month. Your fridge is crying. Cook something."
  },
]

export default function LandingPage() {
  const [mobileMenu, setMobileMenu] = useState(false)
  const [showSignup, setShowSignup] = useState(false)
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const [isLoggedIn] = useState(() => {
    if (typeof window === "undefined") return false
    try {
      const userData = localStorage.getItem("walletroast_user")
      return !!userData && userData !== "null"
    } catch { return false }
  })
  const router = useRouter()

  useEffect(() => {
    const saved = localStorage.getItem("walletroast_theme") as "dark" | "light" | null
    if (saved) setTheme(saved)
  }, [])

  useEffect(() => {
    document.documentElement.className = theme === "light" ? "theme-light" : "dark"
    localStorage.setItem("walletroast_theme", theme)
  }, [theme])

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark")

  const handleSocialClick = () => {
    if (isLoggedIn) {
      router.push("/social")
    } else {
      setShowSignup(true)
    }
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* ─── Navbar ─── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-2xl ${theme === "dark" ? "border-white/[0.04] bg-[#050507]/80" : "border-gray-200/80 bg-white/80 shadow-sm"}`}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <Flame className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">WalletRoast</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className={`text-[13px] transition-colors font-medium ${theme === "dark" ? "text-zinc-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}>Features</a>
              <a href="#how-it-works" className={`text-[13px] transition-colors font-medium ${theme === "dark" ? "text-zinc-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}>How It Works</a>
              <a href="#roast-social" className="text-[13px] text-orange-400 hover:text-orange-300 transition-colors font-semibold flex items-center gap-1">🔥 Social</a>
              <a href="#pricing" className={`text-[13px] transition-colors font-medium ${theme === "dark" ? "text-zinc-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}>Pricing</a>
              {!isLoggedIn && <Link href="/login" className={`text-[13px] transition-colors font-medium ${theme === "dark" ? "text-zinc-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}>Login</Link>}
              <Link href={isLoggedIn ? "/dashboard" : "/register"} className="btn-primary px-5 py-2 rounded-xl text-[13px] font-semibold">
                {isLoggedIn ? "My Dashboard" : "Get Roasted Free"}
              </Link>
              <button
                onClick={toggleTheme}
                className={`w-8 h-8 rounded-lg flex items-center justify-center hover:text-orange-400 hover:bg-orange-500/10 transition-all duration-200 ${theme === "dark" ? "text-zinc-400" : "text-gray-500"}`}
                title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
            <button className={`md:hidden ${theme === "dark" ? "text-zinc-400" : "text-gray-600"}`} onClick={() => setMobileMenu(!mobileMenu)}>
              {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {mobileMenu && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            className={`md:hidden border-t backdrop-blur-2xl ${theme === "dark" ? "border-zinc-800/50 bg-[#050507]/95" : "border-gray-200 bg-white/95"}`}>
            <div className="px-5 py-5 space-y-3">
              <a href="#features" onClick={() => setMobileMenu(false)} className={`block text-sm ${theme === "dark" ? "text-zinc-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}>Features</a>
              <a href="#how-it-works" onClick={() => setMobileMenu(false)} className={`block text-sm ${theme === "dark" ? "text-zinc-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}>How It Works</a>
              <a href="#roast-social" onClick={() => setMobileMenu(false)} className="block text-orange-400 hover:text-orange-300 text-sm font-semibold">🔥 Roast Social</a>
              <a href="#pricing" onClick={() => setMobileMenu(false)} className={`block text-sm ${theme === "dark" ? "text-zinc-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}>Pricing</a>
              {!isLoggedIn && <Link href="/login" className={`block text-sm ${theme === "dark" ? "text-zinc-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}>Login</Link>}
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 text-zinc-400 hover:text-orange-400 text-sm transition-colors"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </button>
              <Link href={isLoggedIn ? "/dashboard" : "/register"} className="block btn-primary px-5 py-2.5 rounded-xl text-center text-sm font-semibold">{isLoggedIn ? "My Dashboard" : "Get Roasted Free"}</Link>
            </div>
          </motion.div>
        )}
      </nav>

      {/* ─── Hero ─── */}
      <section className="hero-gradient relative pt-36 sm:pt-44 pb-24 sm:pb-32 px-5 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/[0.08] border border-orange-500/20 text-orange-400 text-xs font-medium mb-8 tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              Your money needs tough love
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-[2.75rem] sm:text-6xl md:text-7xl font-black tracking-[-0.035em] leading-[1.05] mb-7"
          >
            Stop Being Broke.{" "}
            <br className="hidden sm:block" />
            <span className="gradient-text">Start Taking Control.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className={`text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed font-light ${theme === "dark" ? "text-zinc-400" : "text-gray-500"}`}
          >
            You don&apos;t need another finance app.
            <br className="hidden sm:block" />
            You need the <span className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>truth</span> about your money.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-5"
          >
            <Link href="/register" className="group btn-primary px-8 py-3.5 rounded-2xl text-[15px] font-bold flex items-center gap-2.5">
              Get Roasted Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#how-it-works" className="btn-secondary px-8 py-3.5 rounded-2xl text-[15px] font-semibold">
              See How It Works
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
            className={`text-xs font-medium ${theme === "dark" ? "text-zinc-600" : "text-gray-400"}`}
          >
            Used by people who are tired of wasting money.
          </motion.p>

          {/* ─── Hero Preview Card ─── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mt-14 sm:mt-20 max-w-2xl mx-auto"
          >
            <div className={`rounded-2xl border border-orange-500/20 p-5 sm:p-7 glow-orange-strong animate-pulse-glow ${theme === "dark" ? "bg-[#0c0c10]" : "bg-white shadow-xl shadow-orange-500/5"}`}>
              {/* Mini stats row */}
              <div className="grid grid-cols-4 gap-3 mb-5">
                {[
                  { label: "Spent", value: "$2,847", color: theme === "dark" ? "text-white" : "text-gray-900" },
                  { label: "Remaining", value: "$1,153", color: "text-amber-400" },
                  { label: "Wasted", value: "$432", color: "text-red-400" },
                  { label: "Score", value: "67", color: "text-orange-400", suffix: "/100" },
                ].map((s) => (
                  <div key={s.label} className={`text-center py-3 px-2 rounded-xl ${theme === "dark" ? "bg-white/[0.02] border border-white/[0.04]" : "bg-gray-50 border border-gray-100"}`}>
                    <p className={`text-[10px] sm:text-[11px] uppercase tracking-widest font-medium mb-1 ${theme === "dark" ? "text-zinc-500" : "text-gray-400"}`}>{s.label}</p>
                    <p className={`text-sm sm:text-lg font-bold ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
              {/* Roast preview */}
              <div className="rounded-xl bg-gradient-to-r from-red-500/[0.07] to-orange-500/[0.04] border border-red-500/15 p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5" /> Brutal Mode
                  </span>
                </div>
                <p className={`text-sm sm:text-[15px] leading-relaxed font-light ${theme === "dark" ? "text-zinc-200" : "text-gray-600"}`}>
                  Your kitchen is a museum. You spent <span className="text-red-400 font-semibold">$800</span> on food this month.
                  You&apos;re feeding restaurants more than yourself. <span className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Cook something.</span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Decorative orbs */}
        <div className="absolute top-20 left-0 w-[500px] h-[500px] bg-orange-600/[0.12] rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/[0.08] rounded-full blur-[140px] pointer-events-none" />
      </section>

      {/* ─── Social Proof Bar ─── */}
      <Section className="py-16 px-5 border-t border-white/[0.03]">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { value: 12400, label: "Users tracking", suffix: "+" },
              { value: 2800000, label: "Expenses logged", prefix: "$", suffix: "+" },
              { value: 340000, label: "Money saved", prefix: "$", suffix: "+" },
              { value: 48, label: "Avg. score improvement", suffix: "%" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl sm:text-3xl font-bold mb-1">
                  <AnimatedNumber value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                </p>
                <p className="text-xs text-zinc-500 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── How It Works ─── */}
      <Section id="how-it-works" className="py-24 sm:py-32 px-5 border-t border-white/[0.03]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-orange-400 uppercase tracking-[0.2em] mb-3">How It Works</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Three steps to financial honesty</h2>
            <p className="text-zinc-400 max-w-md mx-auto text-[15px]">Simple process. Real results. No fluff.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { step: "01", title: "Track Everything", desc: "Log expenses in seconds with quick presets for coffee, food, transport. No friction, no excuses.", icon: "📊" },
              { step: "02", title: "Get Roasted", desc: "Our engine analyzes your spending and delivers insights that actually hit. Choose your roast level.", icon: "🔥" },
              { step: "03", title: "Fix Your Habits", desc: "Follow clear, actionable advice. Watch your discipline score rise. Save real money.", icon: "💪" },
            ].map((item, i) => (
              <motion.div key={item.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="glass-card glass-card-hover p-7 sm:p-8 h-full text-center group">
                  <div className="text-4xl mb-5 group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
                  <div className="text-[10px] text-orange-400 font-mono font-bold mb-2 tracking-[0.3em]">STEP {item.step}</div>
                  <h3 className="text-lg font-bold mb-3 tracking-tight">{item.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── Roast Level Selector ─── */}
      <Section className="py-24 sm:py-32 px-5 border-t border-white/[0.03] dot-grid">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-orange-400 uppercase tracking-[0.2em] mb-3">Intensity Control</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Choose Your <span className="gradient-text-fire">Roast Level</span>
            </h2>
            <p className="text-zinc-400 max-w-lg mx-auto text-[15px]">Same truth. Different intensity. Pick what actually motivates you.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {roastCards.map((card, i) => (
              <motion.div key={card.level}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className={`rounded-2xl border p-6 sm:p-7 h-full transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl ${card.color} ${card.bg} ${card.glow} ${card.level === "Brutal" ? "ring-1 ring-red-500/10" : ""}`}>
                  <div className="flex items-center gap-2.5 mb-4">
                    <span className="text-2xl">{card.emoji}</span>
                    <span className={`text-sm font-bold uppercase tracking-wider ${card.accent}`}>{card.level} Mode</span>
                  </div>
                  <p className="text-[15px] text-zinc-300 leading-relaxed font-light">&ldquo;{card.message}&rdquo;</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── Features ─── */}
      <Section id="features" className="py-24 sm:py-32 px-5 border-t border-white/[0.03]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-orange-400 uppercase tracking-[0.2em] mb-3">Features</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Everything you need to <span className="gradient-text">fix your finances</span>
            </h2>
            <p className="text-zinc-400 max-w-md mx-auto text-[15px]">Not just charts. Real tools for real change.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feat, i) => (
              <motion.div key={feat.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="glass-card glass-card-hover p-6 h-full group">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300`}>
                    <feat.icon className="w-5 h-5 text-zinc-200" />
                  </div>
                  <h3 className="text-base font-bold mb-2 tracking-tight">{feat.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{feat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── Roast Social Leaderboard ─── */}
      <Section id="roast-social" className="py-24 sm:py-32 px-5 border-t border-white/[0.03] relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-orange-600/[0.06] rounded-full blur-[160px] pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/[0.08] border border-orange-500/20 text-orange-400 text-xs font-medium mb-5 tracking-wide">
              <MessageCircle className="w-3.5 h-3.5" />
              Social Feature
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-[-0.03em] mb-4">
              🔥 <span className="gradient-text-fire">Roast Social</span>
            </h2>
            <p className="text-zinc-400 max-w-lg mx-auto text-[15px] leading-relaxed">
              Share your spending shame. Compete with friends. Get roasted by the community. The most brutally honest social feed for your finances.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-6">
            {/* Leaderboard */}
            <div className="lg:col-span-3">
              <div className="glass-card rounded-2xl p-6 sm:p-7">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center">
                      <Trophy className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[15px]">Community Leaderboard</h3>
                      <p className="text-[11px] text-zinc-500">This week&apos;s top performers</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">Live</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { rank: 1, name: "SaveQueen", score: 98, badge: "🏆", streak: "12w", wasted: 23, gradient: "from-amber-500 to-yellow-500", medal: "bg-amber-500/15 border-amber-500/25" },
                    { rank: 2, name: "BudgetNinja", score: 94, badge: "🥈", streak: "8w", wasted: 67, gradient: "from-zinc-400 to-zinc-500", medal: "bg-zinc-500/10 border-zinc-500/20" },
                    { rank: 3, name: "PennyKing", score: 91, badge: "🥉", streak: "6w", wasted: 89, gradient: "from-orange-600 to-orange-700", medal: "bg-orange-600/10 border-orange-600/20" },
                    { rank: 4, name: "FrugalFox", score: 87, badge: "⭐", streak: "4w", wasted: 134, gradient: "from-blue-500 to-blue-600", medal: "" },
                    { rank: 5, name: "CashWizard", score: 85, badge: "⭐", streak: "3w", wasted: 156, gradient: "from-purple-500 to-purple-600", medal: "" },
                    { rank: 6, name: "MoneyMaster", score: 82, badge: "", streak: "2w", wasted: 201, gradient: "from-emerald-500 to-emerald-600", medal: "" },
                    { rank: 7, name: "ThriftLord", score: 79, badge: "", streak: "1w", wasted: 245, gradient: "from-pink-500 to-pink-600", medal: "" },
                  ].map((user, i) => (
                    <motion.button
                      key={user.name}
                      onClick={handleSocialClick}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.06, duration: 0.4 }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 hover:translate-x-1 hover:shadow-lg cursor-pointer text-left ${
                        user.medal ? `${user.medal}` : "border-white/[0.04] hover:border-white/[0.08] bg-white/[0.01]"
                      }`}
                    >
                      <span className="text-[13px] font-mono font-bold text-zinc-500 w-5 text-center">{user.rank}</span>
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${user.gradient} flex items-center justify-center text-xs font-bold text-white shrink-0`}>
                        {user.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[13px] text-zinc-200 truncate">{user.name}</span>
                          {user.badge && <span className="text-sm">{user.badge}</span>}
                          {user.streak && <span className="text-[9px] px-1.5 py-0.5 bg-orange-500/10 border border-orange-500/20 rounded-md text-orange-400 font-bold">🔥 {user.streak}</span>}
                        </div>
                        <span className="text-[10px] text-zinc-500">Wasted only ${user.wasted}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-[15px] font-black ${user.score >= 90 ? "text-emerald-400" : user.score >= 80 ? "text-amber-400" : "text-orange-400"}`}>{user.score}</p>
                        <p className="text-[9px] text-zinc-600 uppercase tracking-wider">Score</p>
                      </div>
                    </motion.button>
                  ))}
                </div>

                <button onClick={handleSocialClick}
                  className="w-full mt-5 py-3 rounded-xl border border-dashed border-orange-500/20 text-[13px] font-semibold text-orange-400 hover:bg-orange-500/5 hover:border-orange-500/30 transition-all flex items-center justify-center gap-2">
                  <Users className="w-4 h-4" /> View Full Leaderboard
                </button>
              </div>
            </div>

            {/* Side Info Cards */}
            <div className="lg:col-span-2 space-y-5">
              {/* Live Stats */}
              <div className="glass-card rounded-2xl p-6">
                <h4 className="font-bold text-[14px] mb-4 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400" /> Community Stats
                </h4>
                <div className="space-y-3">
                  {[
                    { label: "Active Roasters", value: "12,847", color: "text-orange-400" },
                    { label: "Roasts Posted", value: "48,293", color: "text-red-400" },
                    { label: "Total Saved", value: "$2.4M", color: "text-emerald-400" },
                    { label: "Avg. Score", value: "67/100", color: "text-amber-400" },
                  ].map(stat => (
                    <div key={stat.label} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                      <span className="text-[12px] text-zinc-500">{stat.label}</span>
                      <span className={`text-[14px] font-bold ${stat.color}`}>{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="glass-card rounded-2xl p-6">
                <h4 className="font-bold text-[14px] mb-4 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-blue-400" /> Recent Roasts
                </h4>
                <div className="space-y-3">
                  {[
                    { name: "Anonymous", msg: "\"$400 on Uber Eats... I'm literally feeding the streets\"", time: "2m ago", emoji: "🔥" },
                    { name: "BudgetBuster", msg: "\"My subscription list is longer than my resume\"", time: "5m ago", emoji: "💀" },
                    { name: "Anonymous", msg: "\"Score: 23/100. I deserve this.\"", time: "12m ago", emoji: "😭" },
                  ].map((post, i) => (
                    <button key={i} onClick={handleSocialClick}
                      className="w-full text-left p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-all duration-200 cursor-pointer group">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-zinc-400">{post.emoji} {post.name}</span>
                        <span className="text-[10px] text-zinc-600">{post.time}</span>
                      </div>
                      <p className="text-[12px] text-zinc-400 leading-relaxed italic group-hover:text-zinc-300 transition-colors">{post.msg}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <button onClick={handleSocialClick}
                className="w-full btn-primary py-4 rounded-2xl text-[14px] font-bold flex items-center justify-center gap-2.5 group">
                <Flame className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Join the Roast
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </Section>

      {/* ─── Pricing ─── */}
      <Section id="pricing" className="py-24 sm:py-32 px-5 border-t border-white/[0.03] dot-grid">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-orange-400 uppercase tracking-[0.2em] mb-3">Pricing</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Simple, honest pricing</h2>
            <p className="text-zinc-400 text-[15px]">Start free. Upgrade when you&apos;re ready for the full experience.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Free */}
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <div className="glass-card p-7 sm:p-8 rounded-2xl h-full">
                <h3 className="text-lg font-bold mb-1">Free</h3>
                <p className="text-sm text-zinc-500 mb-5">For people getting started</p>
                <div className="flex items-baseline gap-1 mb-7">
                  <span className="text-4xl font-black tracking-tight">$0</span>
                  <span className="text-zinc-500 text-sm">/forever</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {["Basic expense tracking", "5 categories", "Basic insights", "Discipline score", "Soft mode only"].map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-zinc-400">
                      <Check className="w-4 h-4 text-zinc-600 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="block w-full py-3 rounded-xl text-center font-semibold btn-secondary text-sm">
                  Get Started Free
                </Link>
              </div>
            </motion.div>

            {/* Pro */}
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}>
              <div className="gradient-border rounded-2xl bg-[#0c0c10] p-7 sm:p-8 h-full relative glow-orange">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1.5 px-4 py-1 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full text-[11px] font-bold tracking-wide shadow-lg shadow-orange-500/20">
                    <Star className="w-3 h-3" /> MOST POPULAR
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-1">Pro</h3>
                <p className="text-sm text-zinc-500 mb-5">For users serious about taking control</p>
                <div className="flex items-baseline gap-1 mb-7">
                  <span className="text-4xl font-black tracking-tight">$9</span>
                  <span className="text-zinc-500 text-sm">/month</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {["Unlimited categories", "Advanced insights", "Projections engine", "Goals system", "All roast levels", "Weekly reports", "Priority support"].map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-zinc-300">
                      <Check className="w-4 h-4 text-orange-400 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-zinc-500 mb-6 leading-relaxed">Most users save more within the first month after understanding their real spending habits.</p>
                <Link href="/register" className="block w-full py-3 rounded-xl text-center font-semibold btn-primary text-sm">
                  Start Pro Trial
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* ─── Final CTA ─── */}
      <Section className="py-28 sm:py-36 px-5 border-t border-white/[0.03]">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 flex items-center justify-center mx-auto mb-8">
            <Flame className="w-7 h-7 text-orange-400" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-[-0.03em] leading-tight mb-5">
            Your money is leaking.<br />
            <span className="gradient-text">Fix it now.</span>
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg mb-10 leading-relaxed font-light max-w-lg mx-auto">
            Track your habits, face the truth, and start keeping more of what you earn.
          </p>
          <Link href="/register" className="inline-flex items-center gap-2.5 btn-primary px-9 py-4 rounded-2xl text-base font-bold">
            Get Roasted Free <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </Section>

      {/* ─── Footer ─── */}
      <footer className={`border-t py-10 px-5 ${theme === "dark" ? "border-white/[0.04]" : "border-gray-200"}`}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <Flame className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-sm">WalletRoast</span>
            <span className={`text-xs ml-1 ${theme === "dark" ? "text-zinc-600" : "text-gray-400"}`}>© 2024</span>
          </div>
          <div className={`flex items-center gap-7 text-xs ${theme === "dark" ? "text-zinc-500" : "text-gray-500"}`}>
            <a href="#" className={`transition-colors ${theme === "dark" ? "hover:text-zinc-300" : "hover:text-gray-900"}`}>Privacy</a>
            <a href="#" className={`transition-colors ${theme === "dark" ? "hover:text-zinc-300" : "hover:text-gray-900"}`}>Terms</a>
            <a href="#" className={`transition-colors ${theme === "dark" ? "hover:text-zinc-300" : "hover:text-gray-900"}`}>Support</a>
          </div>
        </div>
      </footer>

      {/* ─── Signup Modal ─── */}
      {showSignup && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowSignup(false)} />
          <motion.div
            initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md rounded-2xl border border-orange-500/20 bg-[#0c0c10] p-8 shadow-2xl shadow-orange-500/5 text-center"
          >
            <button onClick={() => setShowSignup(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-orange-500/20">
              <Flame className="w-7 h-7 text-white" />
            </div>

            <h3 className="text-xl font-black mb-2 tracking-tight">Join the Roast 🔥</h3>
            <p className="text-sm text-zinc-400 mb-7 leading-relaxed">
              Create a free account to compete on the leaderboard, share your roasts, and start fixing your money habits.
            </p>

            <div className="space-y-3 mb-5">
              <Link href="/register"
                className="block w-full btn-primary py-3.5 rounded-xl text-[14px] font-bold">
                Create Free Account
              </Link>
              <Link href="/login"
                className="block w-full py-3.5 rounded-xl text-[14px] font-semibold border border-white/[0.08] text-zinc-300 hover:bg-white/[0.03] hover:border-white/[0.12] transition-all">
                Already have an account? Login
              </Link>
            </div>

            <p className="text-[11px] text-zinc-600">Free forever. No credit card required.</p>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
