"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { Trophy, Crown, Medal, Flame, TrendingUp, TrendingDown, Zap, ArrowLeft, Star } from "lucide-react"
import Link from "next/link"
import { getUser, getSocialPosts, seedSocialDemoData } from "@/lib/store"
import { generateLeaderboard, getTotalReactions, AVATAR_GRADIENTS } from "@/lib/engines/roast-social-engine"
import type { RoastCard, User, LeaderboardCategory } from "@/lib/types"

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } } }

function Avatar({ name, gradient, size = "md", anonymous = false, isPro = false, photoUrl }: { name: string; gradient: number; size?: "sm" | "md" | "lg" | "xl"; anonymous?: boolean; isPro?: boolean; photoUrl?: string }) {
  const sizeClass = size === "sm" ? "w-7 h-7 text-[10px]" : size === "xl" ? "w-16 h-16 text-2xl" : size === "lg" ? "w-14 h-14 text-xl" : "w-10 h-10 text-sm"
  const gradientClass = isPro ? "from-amber-500 to-yellow-600" : AVATAR_GRADIENTS[gradient % AVATAR_GRADIENTS.length]
  const proRing = isPro ? "ring-2 ring-amber-400 shadow-amber-500/30" : ""
  return (
    <div className="relative shrink-0">
      <div className={`${sizeClass} rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center font-bold text-white shadow-md ${proRing} overflow-hidden`}>
        {photoUrl ? (
          <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          anonymous ? "🔥" : name.charAt(0).toUpperCase()
        )}
      </div>
      {isPro && (
        <div className={`absolute -top-1.5 -right-1 ${size === "xl" ? "w-6 h-6" : size === "lg" ? "w-5 h-5" : size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-sm shadow-amber-500/40 animate-pulse`} style={{ animationDuration: "3s" }}>
          <Crown className={`${size === "xl" || size === "lg" ? "w-3 h-3" : size === "sm" ? "w-2 h-2" : "w-2.5 h-2.5"} text-amber-900`} />
        </div>
      )}
    </div>
  )
}

const LEADERBOARD_TABS: { id: LeaderboardCategory; label: string; icon: React.ElementType; desc: string }[] = [
  { id: "discipline", label: "Top Discipline", icon: Crown, desc: "Highest discipline scores" },
  { id: "comeback", label: "Best Comeback", icon: TrendingUp, desc: "Best score + streak combos" },
  { id: "lowest_waste", label: "Lowest Waste", icon: TrendingDown, desc: "Least money wasted" },
  { id: "viral", label: "Most Viral", icon: Zap, desc: "Most reactions & shares" },
  { id: "streak", label: "Longest Streak", icon: Flame, desc: "Longest posting streaks" },
]

function getStatForCategory(post: RoastCard, category: LeaderboardCategory): string {
  switch (category) {
    case "discipline": return `${post.disciplineScore}/100`
    case "comeback": return `${post.disciplineScore + post.streak * 3} pts`
    case "lowest_waste": return `$${post.wastedAmount}`
    case "viral": return `${getTotalReactions(post) + post.shareCount * 2} score`
    case "streak": return `${post.streak}w`
  }
}

export default function LeaderboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<RoastCard[]>([])
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<LeaderboardCategory>("discipline")

  useEffect(() => {
    const u = getUser()
    if (!u) return
    setUser(u)
    seedSocialDemoData()
    setPosts(getSocialPosts())
    setMounted(true)
  }, [])

  const leaderboard = useMemo(() => {
    return generateLeaderboard(posts, activeTab)
  }, [posts, activeTab])

  const activeTabInfo = LEADERBOARD_TABS.find(t => t.id === activeTab)!

  if (!mounted || !user) {
    return (
      <div className="space-y-5">
        <div className="h-10 w-48 bg-[var(--color-secondary)] rounded-xl animate-pulse" />
        <div className="h-80 bg-[var(--color-secondary)] rounded-2xl animate-pulse" />
      </div>
    )
  }

  return (
    <motion.div className="space-y-6" initial="hidden" animate="visible" variants={stagger}>
      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <Link href="/social" className="flex items-center gap-1.5 text-[12px] text-orange-400 hover:text-orange-300 font-medium mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Feed
          </Link>
          <h1 className="text-2xl sm:text-[1.75rem] font-bold tracking-tight flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-400" /> Leaderboard
          </h1>
          <p className="text-[13px] text-[var(--color-muted-foreground)] mt-1">
            {activeTabInfo.desc}
          </p>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeUp} className="flex gap-2 overflow-x-auto pb-1">
        {LEADERBOARD_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold border transition-all whitespace-nowrap ${
              activeTab === tab.id ? "tab-active" : "border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:border-[var(--color-border-hover)]"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Podium — Top 3 */}
      {leaderboard.length >= 3 && (
        <motion.div variants={fadeUp} className="grid grid-cols-3 gap-2 sm:gap-4">
          {/* 2nd Place */}
          <div className="podium-silver rounded-xl sm:rounded-2xl p-2.5 sm:p-5 text-center flex flex-col items-center pt-6 sm:pt-8">
            <div className="text-xl sm:text-2xl mb-1.5 sm:mb-2">🥈</div>
            <Avatar name={leaderboard[1].username} gradient={leaderboard[1].avatarGradient} anonymous={leaderboard[1].isAnonymous} size="md" isPro={leaderboard[1].userId === user.id} photoUrl={leaderboard[1].userId === user.id ? user.profilePhoto : undefined} />
            <p className="font-bold text-[11px] sm:text-[13px] mt-2 sm:mt-3 truncate w-full">{leaderboard[1].isAnonymous ? "Anonymous" : leaderboard[1].username}</p>
            <p className="text-[14px] sm:text-[18px] font-black mt-0.5 sm:mt-1">{getStatForCategory(leaderboard[1], activeTab)}</p>
            <p className="text-[9px] sm:text-[11px] text-[var(--color-muted-foreground)] mt-0.5 sm:mt-1">2nd Place</p>
          </div>

          {/* 1st Place */}
          <div className="podium-gold rounded-xl sm:rounded-2xl p-2.5 sm:p-5 text-center flex flex-col items-center -mt-2 sm:-mt-4 relative">
            <div className="absolute -top-2 sm:-top-3 left-1/2 -translate-x-1/2">
              <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 drop-shadow-lg" />
            </div>
            <div className="text-2xl sm:text-3xl mb-1.5 sm:mb-2 mt-3 sm:mt-4">🥇</div>
            <Avatar name={leaderboard[0].username} gradient={leaderboard[0].avatarGradient} anonymous={leaderboard[0].isAnonymous} size="lg" isPro={leaderboard[0].userId === user.id} photoUrl={leaderboard[0].userId === user.id ? user.profilePhoto : undefined} />
            <p className="font-bold text-[12px] sm:text-[14px] mt-2 sm:mt-3 truncate w-full">{leaderboard[0].isAnonymous ? "Anonymous" : leaderboard[0].username}</p>
            <p className="text-[16px] sm:text-[22px] font-black mt-0.5 sm:mt-1 gradient-text">{getStatForCategory(leaderboard[0], activeTab)}</p>
            <p className="text-[9px] sm:text-[11px] text-amber-400 font-bold mt-0.5 sm:mt-1">🏆 Champion</p>
          </div>

          {/* 3rd Place */}
          <div className="podium-bronze rounded-xl sm:rounded-2xl p-2.5 sm:p-5 text-center flex flex-col items-center pt-6 sm:pt-8">
            <div className="text-xl sm:text-2xl mb-1.5 sm:mb-2">🥉</div>
            <Avatar name={leaderboard[2].username} gradient={leaderboard[2].avatarGradient} anonymous={leaderboard[2].isAnonymous} size="md" isPro={leaderboard[2].userId === user.id} photoUrl={leaderboard[2].userId === user.id ? user.profilePhoto : undefined} />
            <p className="font-bold text-[11px] sm:text-[13px] mt-2 sm:mt-3 truncate w-full">{leaderboard[2].isAnonymous ? "Anonymous" : leaderboard[2].username}</p>
            <p className="text-[14px] sm:text-[18px] font-black mt-0.5 sm:mt-1">{getStatForCategory(leaderboard[2], activeTab)}</p>
            <p className="text-[9px] sm:text-[11px] text-[var(--color-muted-foreground)] mt-0.5 sm:mt-1">3rd Place</p>
          </div>
        </motion.div>
      )}

      {/* Rest of Leaderboard */}
      <motion.div variants={fadeUp} className="glass-card rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-[var(--color-border)]">
          <h3 className="font-bold text-[14px]">Full Rankings</h3>
        </div>
        <div className="divide-y divide-[var(--color-border)]/50">
          {leaderboard.slice(3).map((post, i) => {
            const rank = i + 4
            const isCurrentUser = post.userId === user.id
            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.4 }}
                className={`flex items-center gap-4 px-5 py-3.5 hover:bg-[var(--color-secondary)]/50 transition-colors ${isCurrentUser ? "bg-orange-500/[0.04] border-l-2 border-l-orange-400" : ""}`}
              >
                <span className={`text-[14px] font-bold w-8 text-center ${isCurrentUser ? "text-orange-400" : "text-[var(--color-muted-foreground)]"}`}>
                  #{rank}
                </span>
                <Avatar name={post.username} gradient={post.avatarGradient} anonymous={post.isAnonymous} size="sm" isPro={isCurrentUser} photoUrl={isCurrentUser ? user.profilePhoto : undefined} />
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-[13px] truncate ${isCurrentUser ? "text-orange-400" : ""}`}>
                    {post.isAnonymous ? "Anonymous 🔥" : post.username}
                    {isCurrentUser && <span className="ml-1 text-[10px] opacity-60">(You)</span>}
                  </p>
                  <p className="text-[11px] text-[var(--color-muted-foreground)]">
                    Score: {post.disciplineScore}/100 · Streak: {post.streak}w
                  </p>
                </div>
                <span className="text-[14px] font-bold shrink-0">{getStatForCategory(post, activeTab)}</span>
              </motion.div>
            )
          })}
        </div>
        {leaderboard.length <= 3 && (
          <div className="p-8 text-center text-[var(--color-muted-foreground)] text-[13px]">
            More rankings will appear as more users post.
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
