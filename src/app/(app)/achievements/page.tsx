"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Trophy, Lock, Flame } from "lucide-react"
import { getUser, getExpenses, getCategories, getBudgets, getGoals, getSocialPosts, getSocialComments } from "@/lib/store"
import { computeAchievements } from "@/lib/engines/achievement-engine"
import type { AchievementResult, Achievement } from "@/lib/types"

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } } }

function AchievementCard({ achievement, isUnlocked }: { achievement: Achievement; isUnlocked: boolean }) {
  const tierColors = {
    bronze: "from-amber-700/20 to-amber-900/10 border-amber-700/30 text-amber-500",
    silver: "from-slate-400/20 to-slate-500/10 border-slate-400/30 text-slate-300",
    gold: "from-yellow-400/20 to-yellow-600/10 border-yellow-400/30 text-yellow-400",
    diamond: "from-cyan-400/20 to-blue-500/10 border-cyan-400/30 text-cyan-400",
    legendary: "from-fuchsia-500/20 to-purple-600/10 border-fuchsia-500/30 text-fuchsia-400",
  }

  const rarityGlow = {
    common: "",
    uncommon: "shadow-[0_0_15px_rgba(148,163,184,0.1)]",
    rare: "shadow-[0_0_15px_rgba(250,204,21,0.15)]",
    epic: "shadow-[0_0_20px_rgba(168,85,247,0.2)] animate-pulse-glow",
    legendary: "shadow-[0_0_25px_rgba(236,72,153,0.25)] animate-pulse-glow",
    secret: "shadow-[0_0_15px_rgba(239,68,68,0.15)]",
  }

  if (!isUnlocked && achievement.isSecret) {
    return (
      <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5 border border-dashed border-[var(--color-border)]/50 opacity-60 flex flex-col items-center justify-center text-center min-h-[220px]">
        <div className="w-12 h-12 rounded-full bg-[var(--color-secondary)] flex items-center justify-center mb-3">
          <Lock className="w-5 h-5 text-[var(--color-muted-foreground)]" />
        </div>
        <h3 className="font-bold text-[14px] text-[var(--color-foreground)] mb-1">???</h3>
        <p className="text-[12px] text-[var(--color-muted-foreground)] mb-3">Secret Achievement</p>
        <div className="text-[10px] uppercase tracking-widest text-[var(--color-muted-foreground)]/50 font-bold">Keep playing to discover</div>
      </motion.div>
    )
  }

  const colors = isUnlocked ? tierColors[achievement.tier] : "from-[var(--color-secondary)] to-[var(--color-background)] border-[var(--color-border)] text-[var(--color-muted-foreground)]"
  const glow = isUnlocked ? rarityGlow[achievement.rarity] : ""

  return (
    <motion.div
      variants={fadeUp}
      className={`glass-card rounded-2xl p-5 border bg-gradient-to-br ${colors} ${glow} relative overflow-hidden transition-all duration-300 hover:-translate-y-1 ${!isUnlocked && "opacity-70 grayscale-[0.5]"}`}
    >
      {isUnlocked && achievement.rarity === 'legendary' && (
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
      )}

      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-black/20 shadow-inner ${!isUnlocked && "grayscale opacity-50"}`}>
          {achievement.emoji}
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">{achievement.tier}</span>
          <span className="text-[10px] opacity-60 capitalize">{achievement.rarity}</span>
        </div>
      </div>

      <h3 className={`font-bold text-[15px] mb-1 ${!isUnlocked && "text-[var(--color-foreground)]"}`}>{achievement.name}</h3>
      <p className="text-[12px] opacity-80 leading-relaxed mb-3 min-h-[36px]">
        {isUnlocked ? achievement.unlockMessage : achievement.unlockMessage.replace(/[0-9]+/g, 'X')}
      </p>

      {isUnlocked && achievement.roast && (
        <div className="mt-auto pt-3 border-t border-black/10">
          <p className="text-[11px] italic opacity-70 leading-relaxed flex items-start gap-1.5">
            <Flame className="w-3.5 h-3.5 shrink-0 mt-0.5 opacity-80" />
            &quot;{achievement.roast}&quot;
          </p>
        </div>
      )}

      {!isUnlocked && achievement.progress > 0 && (
        <div className="mt-auto pt-3">
          <div className="flex justify-between text-[10px] mb-1 opacity-70">
            <span>Progress</span>
            <span>{achievement.progress}%</span>
          </div>
          <div className="h-1.5 bg-black/20 rounded-full overflow-hidden">
            <div className="h-full bg-current opacity-50 rounded-full" style={{ width: `${achievement.progress}%` }} />
          </div>
        </div>
      )}

      {isUnlocked && (
        <div className="absolute top-0 right-0 px-2 py-1 bg-black/20 rounded-bl-lg text-[9px] font-bold">
          +{achievement.xpReward} XP
        </div>
      )}
    </motion.div>
  )
}

export default function AchievementsPage() {
  const [mounted, setMounted] = useState(false)
  const [data, setData] = useState<AchievementResult | null>(null)
  const [filter, setFilter] = useState<"all" | "unlocked" | "locked">("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("All")

  useEffect(() => {
    const user = getUser()
    if (!user) { setMounted(true); return }

    const expenses = getExpenses()
    const categories = getCategories()
    const budgets = getBudgets()
    const goals = getGoals()
    const posts = getSocialPosts()
    const comments = getSocialComments()

    const result = computeAchievements(expenses, categories, budgets, goals, user, posts, comments)
    setData(result)
    setMounted(true)
  }, [])

  if (!mounted || !data) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-[var(--color-secondary)] rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 bg-[var(--color-secondary)] rounded-2xl animate-pulse" />)}
        </div>
      </div>
    )
  }

  const allAchievements = [...data.unlocked.map(a => ({...a, unlocked: true})), ...data.locked.map(a => ({...a, unlocked: false}))]
  const categories = ["All", ...Array.from(new Set(allAchievements.map(a => a.category)))]

  let filtered = allAchievements;
  if (filter === "unlocked") filtered = filtered.filter(a => a.unlocked)
  if (filter === "locked") filtered = filtered.filter(a => !a.unlocked)
  if (categoryFilter !== "All") filtered = filtered.filter(a => a.category === categoryFilter)

  // Sort: Unlocked first, then by progress, then alphabetically
  filtered.sort((a, b) => {
    if (a.unlocked && !b.unlocked) return -1;
    if (!a.unlocked && b.unlocked) return 1;
    if (!a.unlocked && !b.unlocked) return b.progress - a.progress;
    return a.name.localeCompare(b.name);
  });

  return (
    <motion.div className="space-y-6" initial="hidden" animate="visible" variants={stagger}>
      
      {/* Header & Level Info */}
      <motion.div variants={fadeUp} className="glass-card p-6 sm:p-8 rounded-3xl relative overflow-hidden bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border-indigo-500/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[var(--color-background)] flex items-center justify-center font-black text-sm border-2 border-indigo-500 text-indigo-400">
                {data.level}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em] mb-1">Progression</p>
              <h1 className="text-2xl sm:text-[1.75rem] font-black tracking-tight">Roast Master</h1>
              <p className="text-[13px] text-[var(--color-muted-foreground)] mt-1">Total XP: <span className="text-[var(--color-foreground)] font-bold">{data.totalXp.toLocaleString()}</span></p>
            </div>
          </div>

          <div className="flex-1 max-w-md w-full">
            <div className="flex justify-between text-[12px] font-medium mb-2">
              <span className="text-[var(--color-muted-foreground)]">Level {data.level}</span>
              <span className="text-indigo-400">{data.levelProgress}% to Level {data.level + 1}</span>
            </div>
            <div className="h-2.5 bg-black/20 rounded-full overflow-hidden shadow-inner">
              <motion.div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${data.levelProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between mt-3">
              <div className="text-center">
                <p className="text-[10px] text-[var(--color-muted-foreground)] uppercase tracking-wider">Unlocked</p>
                <p className="text-[14px] font-bold">{data.totalUnlocked} <span className="text-[10px] text-[var(--color-muted-foreground)] font-normal">/ {allAchievements.length}</span></p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-[var(--color-muted-foreground)] uppercase tracking-wider">Secrets Found</p>
                <p className="text-[14px] font-bold">{allAchievements.filter(a => a.unlocked && a.isSecret).length}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center bg-[var(--color-secondary)] p-1 rounded-xl w-max">
          {(["all", "unlocked", "locked"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-[13px] font-medium capitalize transition-all ${filter === f ? "bg-[var(--color-background)] shadow-sm text-[var(--color-foreground)]" : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"}`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap transition-all border ${categoryFilter === c ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-400" : "border-[var(--color-border)] bg-[var(--color-secondary)]/50 text-[var(--color-muted-foreground)] hover:bg-[var(--color-secondary)]"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Grid */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((achievement) => (
            <motion.div
              key={achievement.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <AchievementCard achievement={achievement as Achievement} isUnlocked={achievement.unlocked} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <div className="text-center py-20 opacity-50">
          <Trophy className="w-12 h-12 mx-auto mb-4" />
          <p>No achievements found for this filter.</p>
        </div>
      )}
    </motion.div>
  )
}
