"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { Edit3, Save, Award, Flame, ArrowLeft, Crown } from "lucide-react"
import Link from "next/link"
import { getUser, getSocialPosts, saveSocialProfile, initSocialProfile, seedSocialDemoData, getSocialComments } from "@/lib/store"
import { getTotalReactions, AVATAR_GRADIENTS } from "@/lib/engines/roast-social-engine"
import { SOCIAL_BADGES } from "@/lib/types"
import type { User, SocialProfile, RoastCard } from "@/lib/types"

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } } }

function Avatar({ name, gradient, size = "md", anonymous = false, isPro = false, photoUrl }: { name: string; gradient: number; size?: "sm" | "md" | "lg" | "xl" | "2xl"; anonymous?: boolean; isPro?: boolean; photoUrl?: string }) {
  const sizeClass = size === "sm" ? "w-7 h-7 text-[10px]" : size === "2xl" ? "w-24 h-24 text-4xl" : size === "xl" ? "w-16 h-16 text-2xl" : size === "lg" ? "w-14 h-14 text-xl" : "w-10 h-10 text-sm"
  const gradientClass = isPro ? "from-amber-500 to-yellow-600" : AVATAR_GRADIENTS[gradient % AVATAR_GRADIENTS.length]
  const proRing = isPro ? "ring-2 ring-amber-400 shadow-amber-500/30" : ""
  return (
    <div className="relative shrink-0">
      <div className={`${sizeClass} rounded-2xl bg-gradient-to-br ${gradientClass} flex items-center justify-center font-bold text-white shadow-lg ${proRing} overflow-hidden`}>
        {photoUrl ? (
          <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          anonymous ? "🔥" : name.charAt(0).toUpperCase()
        )}
      </div>
      {isPro && size !== "sm" && (
        <div className={`absolute -top-1.5 -right-1 ${size === "2xl" ? "w-7 h-7" : size === "xl" || size === "lg" ? "w-5 h-5" : "w-4 h-4"} rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-sm shadow-amber-500/40 animate-pulse`} style={{ animationDuration: "3s" }}>
          <Crown className={`${size === "2xl" ? "w-4 h-4" : size === "xl" || size === "lg" ? "w-3 h-3" : "w-2.5 h-2.5"} text-amber-900`} />
        </div>
      )}
    </div>
  )
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return `${Math.floor(days / 7)}w ago`
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<SocialProfile | null>(null)
  const [posts, setPosts] = useState<RoastCard[]>([])
  const [mounted, setMounted] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState("")
  const [editBio, setEditBio] = useState("")

  useEffect(() => {
    const u = getUser()
    if (!u) return
    setUser(u)
    seedSocialDemoData()
    const p = initSocialProfile(u)
    setProfile(p)
    setPosts(getSocialPosts())
    setEditName(p.displayName)
    setEditBio(p.bio)
    setMounted(true)
  }, [])

  const userPosts = useMemo(() => {
    if (!user) return []
    return posts.filter(p => p.userId === user.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [posts, user])

  const stats = useMemo(() => {
    if (!user) return { totalReactions: 0, totalComments: 0, avgScore: 0 }
    const totalReactions = userPosts.reduce((s, p) => s + getTotalReactions(p), 0)
    const allComments = getSocialComments()
    const totalComments = allComments.filter(c => c.userId === user.id).length
    const avgScore = userPosts.length > 0 ? Math.round(userPosts.reduce((s, p) => s + p.disciplineScore, 0) / userPosts.length) : 0
    return { totalReactions, totalComments, avgScore }
  }, [userPosts, user])

  // Compute earned badges
  const earnedBadges = useMemo(() => {
    if (!user) return []
    const badges: string[] = []
    if (userPosts.length >= 1) badges.push("first_roast")
    if (userPosts.some(p => p.roastLevel === "brutal")) badges.push("brutal_survivor")
    if (userPosts.some(p => p.disciplineScore >= 90)) badges.push("discipline_king")
    if (userPosts.some(p => p.streak >= 3)) badges.push("streak_warrior")
    if (stats.totalComments >= 10) badges.push("social_butterfly")
    return badges
  }, [userPosts, user, stats])

  const handleSave = () => {
    if (!profile) return
    const updated = { ...profile, displayName: editName, bio: editBio, badges: earnedBadges, postCount: userPosts.length }
    saveSocialProfile(updated)
    setProfile(updated)
    setEditing(false)
  }

  if (!mounted || !user || !profile) {
    return (
      <div className="space-y-5">
        <div className="h-10 w-48 bg-[var(--color-secondary)] rounded-xl animate-pulse" />
        <div className="h-56 bg-[var(--color-secondary)] rounded-2xl animate-pulse" />
      </div>
    )
  }

  return (
    <motion.div className="space-y-6" initial="hidden" animate="visible" variants={stagger}>
      {/* Header */}
      <motion.div variants={fadeUp}>
        <Link href="/social" className="flex items-center gap-1.5 text-[12px] text-orange-400 hover:text-orange-300 font-medium mb-4">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Feed
        </Link>
      </motion.div>

      {/* Profile Card */}
      <motion.div variants={fadeUp} className="glass-card rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar with gradient ring + Pro Crown */}
          <div className="relative">
            <div className={`p-1 rounded-2xl ${user.subscriptionPlan === "pro" ? "bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-400" : "gradient-border"}`}>
              <Avatar name={profile.displayName || user.name} gradient={profile.avatarGradient} size="2xl" isPro={user.subscriptionPlan === "pro"} photoUrl={user.profilePhoto} />
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left">
            {editing ? (
              <div className="space-y-3">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="input-premium w-full text-[15px] font-bold"
                  placeholder="Display Name"
                />
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="input-premium w-full text-[13px] resize-none"
                  rows={2}
                  placeholder="Write a short bio..."
                />
                <div className="flex gap-2">
                  <button onClick={handleSave}
                    className="btn-primary px-4 py-2 rounded-xl text-[13px] font-semibold flex items-center gap-1.5">
                    <Save className="w-3.5 h-3.5" /> Save
                  </button>
                  <button onClick={() => setEditing(false)}
                    className="btn-secondary px-4 py-2 rounded-xl text-[13px] font-semibold">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center sm:justify-start gap-3 mb-1">
                  <h2 className="text-xl font-bold">{profile.displayName || user.name}</h2>
                  <button onClick={() => setEditing(true)}
                    className="text-[var(--color-muted-foreground)] hover:text-orange-400 transition-colors">
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[13px] text-[var(--color-muted-foreground)] mb-3">
                  {profile.bio || "No bio yet. Click edit to add one!"}
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/15 text-[11px] font-bold text-orange-400">
                    {user.roastLevel === "soft" ? "😊" : user.roastLevel === "direct" ? "😐" : "🔥"} {user.roastLevel.charAt(0).toUpperCase() + user.roastLevel.slice(1)} Mode
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/15 text-[11px] font-bold text-emerald-400">
                    Member since {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="stat-card text-center">
          <p className="text-[11px] text-[var(--color-muted-foreground)] uppercase tracking-[0.15em] font-semibold mb-2">Posts</p>
          <p className="text-[1.5rem] font-bold">{userPosts.length}</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-[11px] text-[var(--color-muted-foreground)] uppercase tracking-[0.15em] font-semibold mb-2">Reactions</p>
          <p className="text-[1.5rem] font-bold text-orange-400">{stats.totalReactions}</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-[11px] text-[var(--color-muted-foreground)] uppercase tracking-[0.15em] font-semibold mb-2">Avg Score</p>
          <p className="text-[1.5rem] font-bold">{stats.avgScore}<span className="text-sm font-medium opacity-50">/100</span></p>
        </div>
        <div className="stat-card text-center">
          <p className="text-[11px] text-[var(--color-muted-foreground)] uppercase tracking-[0.15em] font-semibold mb-2">Comments</p>
          <p className="text-[1.5rem] font-bold text-blue-400">{stats.totalComments}</p>
        </div>
      </motion.div>

      {/* Badges */}
      {user.subscriptionPlan === "pro" ? (
        <motion.div variants={fadeUp} className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="font-bold text-[15px]">Badges</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SOCIAL_BADGES.map(badge => {
              const earned = earnedBadges.includes(badge.id)
              return (
                <div key={badge.id}
                  className={`p-4 rounded-xl border transition-all ${earned
                      ? "bg-[var(--color-secondary)]/80 border-orange-500/20 badge-shine"
                      : "border-[var(--color-border)] opacity-40"
                    }`}>
                  <div className="text-2xl mb-2">{badge.icon}</div>
                  <p className={`font-bold text-[13px] ${earned ? "" : "text-[var(--color-muted-foreground)]"}`}>{badge.label}</p>
                  <p className="text-[11px] text-[var(--color-muted-foreground)] mt-0.5">{badge.description}</p>
                  {earned && (
                    <span className="inline-block mt-2 px-2 py-0.5 rounded-md bg-emerald-500/10 text-[9px] font-bold text-emerald-400 border border-emerald-500/20">
                      ✓ EARNED
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </motion.div>
      ) : (
        <motion.div variants={fadeUp} className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center text-center">
          <Crown className="w-8 h-8 text-amber-400 mb-3 opacity-50" />
          <h3 className="font-bold text-[15px] mb-1">Badges Locked</h3>
          <p className="text-[13px] text-[var(--color-muted-foreground)] max-w-sm mb-4">
            Upgrade to Pro to unlock social badges and show off your financial discipline to the community.
          </p>
          <Link href="/settings" className="btn-primary px-4 py-2 rounded-xl text-[12px] font-semibold flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5" /> Upgrade to Pro
          </Link>
        </motion.div>
      )}

      {/* User's Posts */}
      <motion.div variants={fadeUp} className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <h3 className="font-bold text-[15px]">Your Roasts</h3>
        </div>
        {userPosts.length === 0 ? (
          <div className="text-center py-10">
            <Flame className="w-10 h-10 text-[var(--color-muted-foreground)] mx-auto mb-3 opacity-30" />
            <p className="text-[var(--color-muted-foreground)] text-[13px] mb-3">You haven&apos;t posted any roasts yet.</p>
            <Link href="/social" className="btn-primary px-5 py-2.5 rounded-xl text-[13px] font-semibold inline-flex items-center gap-2">
              <Flame className="w-4 h-4" /> Post Your First Roast
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {userPosts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`p-4 rounded-xl roast-${post.roastLevel} bg-[var(--color-secondary)]/50 hover:bg-[var(--color-secondary)] transition-colors`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold">Score: {post.disciplineScore}/100</span>
                    {post.streak > 0 && (
                      <span className="text-[10px] text-orange-400 font-bold">🔥 {post.streak}w streak</span>
                    )}
                  </div>
                  <span className="text-[11px] text-[var(--color-muted-foreground)]">{timeAgo(post.createdAt)}</span>
                </div>
                <p className="text-[13px] italic text-[var(--color-foreground)]/85">&ldquo;{post.roastMessage}&rdquo;</p>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-[var(--color-muted-foreground)]">
                  <span>{post.biggestWasteIcon} {post.biggestWasteCategory} — ${post.wastedAmount}</span>
                  <span className="text-[var(--color-border)]">·</span>
                  <span>{getTotalReactions(post)} reactions</span>
                  <span className="text-[var(--color-border)]">·</span>
                  <span>{post.shareCount} shares</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
