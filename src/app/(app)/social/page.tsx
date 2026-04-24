"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Users, Flame, TrendingUp, Clock, Trophy, Skull, Plus, X,
  MessageCircle, Share2, Send, Trash2,
  Eye, EyeOff, ArrowRight, Zap,
  Crown, Target, Heart, Sparkles, AlertTriangle
} from "lucide-react"
import Link from "next/link"
import {
  getUser, getSocialPosts, addSocialPost, toggleReaction, getPostComments,
  addSocialComment, deleteSocialComment, toggleCommentReaction, seedSocialDemoData,
  initSocialProfile, incrementShareCount, getCurrentMonthExpenses,
  getBudgets, getCategories,
} from "@/lib/store"
import { generateUserRoastCard, getTotalReactions, AVATAR_GRADIENTS } from "@/lib/engines/roast-social-engine"
import { calculateDisciplineScore } from "@/lib/engines/discipline-score"
import { SOCIAL_REACTIONS } from "@/lib/types"
import type { RoastCard, SocialComment, User, SocialProfile } from "@/lib/types"
import { generateId } from "@/lib/utils"

// ─── Animations ───
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } } }

type FeedTab = "trending" | "latest" | "top" | "brutal"

// ─── Mini Score Ring ───
function MiniScoreRing({ score, size = 40 }: { score: number; size?: number }) {
  const r = (size / 2) - 4
  const circumference = 2 * Math.PI * r
  const offset = circumference - (score / 100) * circumference
  const color = score >= 70 ? "#10b981" : score >= 50 ? "#f59e0b" : score >= 30 ? "#f97316" : "#ef4444"

  return (
    <svg className="score-mini-ring" width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--color-border)" strokeWidth="3" fill="none" />
      <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth="3" fill="none"
        strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.8s ease" }} />
      <text x={size / 2} y={size / 2 + 1} textAnchor="middle" dominantBaseline="middle"
        fill="var(--color-foreground)" fontSize={size * 0.28} fontWeight="800"
        style={{ transform: "rotate(90deg)", transformOrigin: "center" }}>{score}</text>
    </svg>
  )
}

// ─── Avatar Component ───
function Avatar({ name, gradient, size = "md", anonymous = false, isPro = false, photoUrl }: { name: string; gradient: number; size?: "sm" | "md" | "lg"; anonymous?: boolean; isPro?: boolean; photoUrl?: string }) {
  const sizeClass = size === "sm" ? "w-7 h-7 text-[10px]" : size === "lg" ? "w-14 h-14 text-xl" : "w-10 h-10 text-sm"
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
      {isPro && size !== "sm" && (
        <div className={`absolute -top-1.5 -right-1 ${size === "lg" ? "w-5 h-5" : "w-4 h-4"} rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-sm shadow-amber-500/40 animate-pulse`} style={{ animationDuration: "3s" }}>
          <Crown className={`${size === "lg" ? "w-3 h-3" : "w-2.5 h-2.5"} text-amber-900`} />
        </div>
      )}
    </div>
  )
}

// ─── Time Ago ───
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

// ─── Roast Post Card ───
function RoastPostCard({
  post, user, onReact, onOpenComments, commentCount
}: {
  post: RoastCard; user: User; onReact: (postId: string, emoji: string) => void
  onOpenComments: (postId: string) => void; commentCount: number
}) {
  const [popEmoji, setPopEmoji] = useState<string | null>(null)
  const totalReactions = getTotalReactions(post)
  const levelColor = post.roastLevel === "brutal" ? "text-red-400" : post.roastLevel === "direct" ? "text-amber-400" : "text-blue-400"

  const handleReact = (emoji: string) => {
    setPopEmoji(emoji)
    onReact(post.id, emoji)
    setTimeout(() => setPopEmoji(null), 300)
  }

  const handleShare = async () => {
    incrementShareCount(post.id)
    if (navigator.share) {
      try {
        await navigator.share({
          title: "WalletRoast 🔥",
          text: `${post.isAnonymous ? "Anonymous" : post.username}: Score ${post.disciplineScore}/100 — "${post.roastMessage}"`,
          url: window.location.href,
        })
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(
        `🔥 WalletRoast — Score: ${post.disciplineScore}/100 | Wasted: $${post.wastedAmount} on ${post.biggestWasteCategory} | "${post.roastMessage}"`
      )
    }
  }

  return (
    <motion.div variants={fadeUp} className={`glass-card rounded-2xl p-4 sm:p-5 roast-${post.roastLevel} hover:border-[var(--color-border-hover)] transition-all duration-300`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Avatar name={post.username} gradient={post.avatarGradient} anonymous={post.isAnonymous} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[13px] truncate">
              {post.isAnonymous ? "Anonymous 🔥" : post.username}
            </span>
            {post.streak > 0 && (
              <span className="px-1.5 py-0.5 bg-orange-500/10 border border-orange-500/20 rounded-md text-[9px] font-bold text-orange-400">
                🔥 {post.streak}w
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[var(--color-muted-foreground)]">
            <span>{timeAgo(post.createdAt)}</span>
            <span className="text-[var(--color-border)]">·</span>
            <span className={`${levelColor} font-semibold`}>
              {post.roastLevel.charAt(0).toUpperCase() + post.roastLevel.slice(1)}
            </span>
          </div>
        </div>
        <MiniScoreRing score={post.disciplineScore} size={44} />
      </div>

      {/* Waste info */}
      <div className="flex items-center gap-3 mb-3 p-3 rounded-xl bg-[var(--color-secondary)]/60">
        <span className="text-2xl">{post.biggestWasteIcon}</span>
        <div className="flex-1">
          <p className="text-[12px] text-[var(--color-muted-foreground)]">Biggest Waste</p>
          <p className="text-[14px] font-bold">{post.biggestWasteCategory}</p>
        </div>
        <div className="text-right">
          <p className="text-[12px] text-[var(--color-muted-foreground)]">Wasted</p>
          <p className="text-[14px] font-bold text-red-400">${post.wastedAmount}</p>
        </div>
      </div>

      {/* Roast message */}
      <p className="text-[14px] text-[var(--color-foreground)]/90 leading-relaxed mb-4 italic">
        &ldquo;{post.roastMessage}&rdquo;
      </p>

      {/* Emoji Reactions */}
      <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-3">
        {SOCIAL_REACTIONS.map(emoji => {
          const count = post.reactions[emoji]?.length || 0
          const isActive = post.reactions[emoji]?.includes(user.id) || false
          return (
            <button
              key={emoji}
              onClick={() => handleReact(emoji)}
              className={`emoji-btn ${isActive ? "active" : ""} ${popEmoji === emoji ? "emoji-pop" : ""}`}
            >
              <span>{emoji}</span>
              {count > 0 && <span className="text-[11px] font-semibold text-[var(--color-muted-foreground)]">{count}</span>}
            </button>
          )
        })}
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-1 pt-3 border-t border-[var(--color-border)]/50">
        {!post.commentsDisabled && (
          <button onClick={() => onOpenComments(post.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-secondary)] transition-all">
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{commentCount}</span>
          </button>
        )}
        <button onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-secondary)] transition-all">
          <Share2 className="w-3.5 h-3.5" />
          <span>{post.shareCount}</span>
        </button>
        <div className="flex-1" />
        <span className="text-[11px] text-[var(--color-muted-foreground)]">
          {totalReactions} reactions
        </span>
      </div>
    </motion.div>
  )
}

// ─── Comments Section ───
function CommentsSection({
  postId, user, profile, comments, onClose
}: {
  postId: string; user: User; profile: SocialProfile; comments: SocialComment[]
  onClose: () => void
}) {
  const [newComment, setNewComment] = useState("")
  const [localComments, setLocalComments] = useState(comments)

  const handleSubmit = () => {
    if (!newComment.trim()) return
    const comment: SocialComment = {
      id: generateId(),
      postId,
      userId: user.id,
      username: profile.displayName || user.name,
      avatarGradient: profile.avatarGradient,
      text: newComment.trim(),
      createdAt: new Date().toISOString(),
      reactions: {},
      parentId: null,
    }
    addSocialComment(comment)
    setLocalComments(prev => [comment, ...prev])
    setNewComment("")
  }

  const handleDelete = (id: string) => {
    deleteSocialComment(id)
    setLocalComments(prev => prev.filter(c => c.id !== id))
  }

  const handleReactComment = (commentId: string, emoji: string) => {
    toggleCommentReaction(commentId, emoji, user.id)
    setLocalComments(prev => prev.map(c => {
      if (c.id !== commentId) return c
      const reactions = { ...c.reactions }
      if (!reactions[emoji]) reactions[emoji] = []
      const idx = reactions[emoji].indexOf(user.id)
      if (idx >= 0) {
        reactions[emoji] = reactions[emoji].filter(id => id !== user.id)
        if (reactions[emoji].length === 0) delete reactions[emoji]
      } else {
        reactions[emoji] = [...reactions[emoji], user.id]
      }
      return { ...c, reactions }
    }))
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="glass-card rounded-2xl p-4 mt-2">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-[13px]">Comments ({localComments.length})</h4>
          <button onClick={onClose} className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Comment input */}
        <div className="flex gap-2 mb-4">
          <Avatar name={user.name} gradient={profile.avatarGradient} size="sm" isPro={true} photoUrl={user.profilePhoto} />
          <div className="flex-1 flex gap-2">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Drop a comment..."
              className="input-premium flex-1 text-[13px] py-2 px-3"
            />
            <button onClick={handleSubmit}
              className="btn-primary px-3 py-2 rounded-xl text-[12px] font-semibold flex items-center gap-1">
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Comments list */}
        <div className="space-y-3 max-h-[320px] overflow-y-auto">
          {localComments.length === 0 ? (
            <p className="text-center text-[var(--color-muted-foreground)] text-[13px] py-6">No comments yet. Be the first!</p>
          ) : (
            localComments.map(comment => (
              <div key={comment.id} className="flex gap-2.5 group">
                <Avatar name={comment.username} gradient={comment.avatarGradient} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-[12px]">{comment.username}</span>
                    <span className="text-[10px] text-[var(--color-muted-foreground)]">{timeAgo(comment.createdAt)}</span>
                  </div>
                  <p className="text-[13px] text-[var(--color-foreground)]/85 leading-relaxed">{comment.text}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <button onClick={() => handleReactComment(comment.id, "🔥")}
                      className="text-[11px] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors">
                      🔥 {comment.reactions["🔥"]?.length || 0}
                    </button>
                    {comment.userId === user.id && (
                      <button onClick={() => handleDelete(comment.id)}
                        className="text-[11px] text-[var(--color-muted-foreground)] hover:text-red-400 transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100">
                        <Trash2 className="w-3 h-3 inline" /> Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Create Post Modal ───
function CreatePostModal({
  user, profile, onClose, onPost
}: {
  user: User; profile: SocialProfile; onClose: () => void
  onPost: (post: RoastCard) => void
}) {
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [commentsDisabled, setCommentsDisabled] = useState(false)
  const [roastLevel, setRoastLevel] = useState(user.roastLevel)
  const [customMessage, setCustomMessage] = useState("")
  const [selectedMood, setSelectedMood] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const MAX_CHARS = 280

  const quickEmojis = ["🔥", "💀", "😭", "🤡", "💸", "😱", "🎯", "💪", "🤦", "😤", "🥲", "💰"]
  const moods = [
    { emoji: "😤", label: "Frustrated" },
    { emoji: "😭", label: "Crying" },
    { emoji: "🤡", label: "Clown Move" },
    { emoji: "💪", label: "Motivated" },
    { emoji: "😱", label: "Shocked" },
    { emoji: "🥲", label: "Coping" },
  ]
  const hashtags = ["#BudgetFail", "#MoneyWasted", "#RoastMe", "#FinancialShame", "#NoBudget", "#ImpulseBuy", "#CoffeeAddict", "#SubHell"]

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : prev.length < 3 ? [...prev, tag] : prev)
  }

  const cardData = useMemo(() => {
    const expenses = getCurrentMonthExpenses()
    const categories = getCategories()
    const budgets = getBudgets()

    const catSpending = categories.map(cat => {
      const spent = expenses.filter(e => e.categoryId === cat.id).reduce((s, e) => s + e.amount, 0)
      const budget = budgets.find(b => b.categoryId === cat.id)?.monthlyLimit || 0
      return { category: cat, spent, budget, percentage: budget > 0 ? (spent / budget) * 100 : 0 }
    }).filter(c => c.spent > 0 || c.budget > 0).sort((a, b) => b.spent - a.spent)

    const uniqueDays = new Set(expenses.map(e => new Date(e.expenseDate).toDateString())).size
    const subCat = catSpending.find(c => c.category.name.toLowerCase().includes("subscription"))
    const scoreData = calculateDisciplineScore({
      categorySpending: catSpending,
      hasSubscriptions: !!subCat,
      subscriptionCount: subCat ? expenses.filter(e => e.categoryId === subCat.category.id).length : 0,
      savingsContribution: 0,
      totalExpenseCount: expenses.length,
      daysTracked: uniqueDays,
    })

    return { catSpending, score: scoreData.score }
  }, [])

  const previewCard = useMemo(() => {
    return generateUserRoastCard({
      userId: user.id,
      username: isAnonymous ? "Anonymous" : (profile.displayName || user.name),
      avatarGradient: profile.avatarGradient,
      disciplineScore: cardData.score,
      categorySpending: cardData.catSpending,
      roastLevel,
      isAnonymous,
      commentsDisabled,
    })
  }, [user, profile, cardData, roastLevel, isAnonymous, commentsDisabled])

  const finalMessage = customMessage.trim() || previewCard.roastMessage
  const tagString = selectedTags.length > 0 ? " " + selectedTags.join(" ") : ""
  const moodString = selectedMood ? ` ${selectedMood}` : ""

  const handlePost = () => {
    const finalCard = {
      ...previewCard,
      roastMessage: finalMessage + tagString + moodString,
    }
    onPost(finalCard)
    onClose()
  }

  const insertEmoji = (emoji: string) => {
    if (customMessage.length + 2 <= MAX_CHARS) {
      setCustomMessage(prev => prev + emoji)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="relative w-full sm:max-w-xl glass-card rounded-t-2xl sm:rounded-2xl p-4 sm:p-6 border border-[var(--color-border)] shadow-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/15 to-red-500/10 flex items-center justify-center">
              <Flame className="w-4 h-4 text-orange-400" />
            </div>
            Post Your Roast
          </h2>
          <button onClick={onClose} className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ─── Roast Message Editor ─── */}
        <div className="mb-5">
          <label className="text-[12px] font-semibold text-[var(--color-muted-foreground)] uppercase tracking-[0.1em] mb-2 block">
            Your Roast Message
          </label>
          <div className="relative">
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value.slice(0, MAX_CHARS))}
              placeholder={previewCard.roastMessage}
              className="w-full input-premium rounded-xl p-4 text-[14px] leading-relaxed resize-none min-h-[100px]"
              rows={3}
            />
            <div className="flex items-center justify-between mt-2">
              <div className="flex gap-1 flex-wrap max-w-full">
                {quickEmojis.map(emoji => (
                  <button key={emoji} onClick={() => insertEmoji(emoji)}
                    className="w-7 h-7 rounded-lg hover:bg-[var(--color-secondary)] flex items-center justify-center text-sm transition-all hover:scale-110">
                    {emoji}
                  </button>
                ))}
              </div>
              <span className={`text-[11px] font-mono ${customMessage.length > MAX_CHARS * 0.9 ? "text-red-400" : "text-[var(--color-muted-foreground)]"}`}>
                {customMessage.length}/{MAX_CHARS}
              </span>
            </div>
          </div>
        </div>

        {/* ─── Mood Selector ─── */}
        <div className="mb-4">
          <label className="text-[12px] font-semibold text-[var(--color-muted-foreground)] uppercase tracking-[0.1em] mb-2 block">
            How are you feeling?
          </label>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {moods.map(mood => (
              <button key={mood.label} onClick={() => setSelectedMood(selectedMood === mood.emoji ? "" : mood.emoji)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-[12px] font-medium border transition-all duration-200 flex items-center gap-1 sm:gap-1.5 ${
                  selectedMood === mood.emoji
                    ? "border-orange-500/40 bg-orange-500/10 text-orange-400 ring-1 ring-orange-500/20"
                    : "border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:border-[var(--color-border-hover)]"
                }`}>
                <span>{mood.emoji}</span> {mood.label}
              </button>
            ))}
          </div>
        </div>

        {/* ─── Hashtags ─── */}
        <div className="mb-5">
          <label className="text-[12px] font-semibold text-[var(--color-muted-foreground)] uppercase tracking-[0.1em] mb-2 flex items-center justify-between">
            <span>Tags <span className="text-[10px] font-normal">(max 3)</span></span>
            {selectedTags.length > 0 && <span className="text-orange-400">{selectedTags.length}/3</span>}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {hashtags.map(tag => (
              <button key={tag} onClick={() => toggleTag(tag)}
                className={`px-2 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-semibold border transition-all duration-200 ${
                  selectedTags.includes(tag)
                    ? "border-orange-500/40 bg-orange-500/10 text-orange-400"
                    : "border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:border-[var(--color-border-hover)]"
                }`}>
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* ─── Roast Level ─── */}
        <div className="mb-4">
          <label className="text-[12px] font-semibold text-[var(--color-muted-foreground)] uppercase tracking-[0.1em] mb-2 block">Roast Level</label>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {(["soft", "direct", "brutal"] as const).map(level => (
              <button key={level} onClick={() => setRoastLevel(level)}
                className={`px-3 py-2.5 rounded-xl text-[13px] font-semibold border transition-all ${roastLevel === level
                  ? level === "brutal" ? "bg-red-500/10 border-red-500/30 text-red-400"
                    : level === "direct" ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                    : "bg-blue-500/10 border-blue-500/30 text-blue-400"
                  : "border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:border-[var(--color-border-hover)]"
                }`}>
                {level === "soft" ? "😊" : level === "direct" ? "😐" : "🔥"} {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* ─── Toggles ─── */}
        <div className="space-y-2 mb-5">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-secondary)]/50">
            <div className="flex items-center gap-2 text-[13px]">
              {isAnonymous ? <EyeOff className="w-4 h-4 text-orange-400" /> : <Eye className="w-4 h-4 text-[var(--color-muted-foreground)]" />}
              <span>Post Anonymously</span>
            </div>
            <button onClick={() => setIsAnonymous(!isAnonymous)}
              className={`w-10 h-5 rounded-full transition-all duration-300 ${isAnonymous ? "bg-orange-500" : "bg-[var(--color-border)]"}`}>
              <div className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300 ${isAnonymous ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-secondary)]/50">
            <div className="flex items-center gap-2 text-[13px]">
              <MessageCircle className="w-4 h-4 text-[var(--color-muted-foreground)]" />
              <span>Disable Comments</span>
            </div>
            <button onClick={() => setCommentsDisabled(!commentsDisabled)}
              className={`w-10 h-5 rounded-full transition-all duration-300 ${commentsDisabled ? "bg-orange-500" : "bg-[var(--color-border)]"}`}>
              <div className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300 ${commentsDisabled ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>
        </div>

        {/* ─── Live Preview ─── */}
        <div className="mb-5">
          <label className="text-[12px] font-semibold text-[var(--color-muted-foreground)] uppercase tracking-[0.1em] mb-2 block flex items-center gap-1.5">
            <Eye className="w-3 h-3" /> Live Preview
          </label>
          <div className="roast-card-fire rounded-2xl p-4 bg-[var(--color-secondary)]/50">
            <div className="flex items-center gap-3 mb-3">
              <Avatar name={previewCard.username} gradient={previewCard.avatarGradient} anonymous={isAnonymous} isPro={!isAnonymous} photoUrl={!isAnonymous ? user.profilePhoto : undefined} />
              <div className="flex-1">
                <p className="font-bold text-[13px]">{isAnonymous ? "Anonymous 🔥" : previewCard.username}</p>
                <div className="flex items-center gap-2 text-[11px] text-[var(--color-muted-foreground)]">
                  <span>Just now</span>
                  <span className="text-[var(--color-border)]">·</span>
                  <span className={`font-semibold ${roastLevel === "brutal" ? "text-red-400" : roastLevel === "direct" ? "text-amber-400" : "text-blue-400"}`}>
                    {roastLevel.charAt(0).toUpperCase() + roastLevel.slice(1)}
                  </span>
                  {selectedMood && <span>{selectedMood}</span>}
                </div>
              </div>
              <MiniScoreRing score={previewCard.disciplineScore} size={40} />
            </div>
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[var(--color-background)]/50 mb-2.5">
              <span className="text-xl">{previewCard.biggestWasteIcon}</span>
              <div className="flex-1">
                <p className="text-[11px] text-[var(--color-muted-foreground)]">Biggest Waste</p>
                <p className="text-[13px] font-bold">{previewCard.biggestWasteCategory}</p>
              </div>
              <p className="text-[13px] font-bold text-red-400">${previewCard.wastedAmount}</p>
            </div>
            <p className="text-[13px] italic text-[var(--color-foreground)]/85 leading-relaxed">
              &ldquo;{finalMessage}&rdquo;
            </p>
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {selectedTags.map(tag => (
                  <span key={tag} className="text-[10px] font-semibold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-md">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ─── Actions ─── */}
        <div className="flex gap-3">
          <button onClick={onClose}
            className="btn-secondary flex-1 px-4 py-2.5 rounded-xl text-[13px] font-semibold">
            Cancel
          </button>
          <button onClick={handlePost}
            className="btn-primary flex-1 px-4 py-2.5 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-2">
            <Flame className="w-4 h-4" /> Post Roast
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Main Page ───
export default function SocialPage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<SocialProfile | null>(null)
  const [posts, setPosts] = useState<RoastCard[]>([])
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<FeedTab>("trending")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [openCommentsPostId, setOpenCommentsPostId] = useState<string | null>(null)
  const [commentsMap, setCommentsMap] = useState<Record<string, SocialComment[]>>({})

  useEffect(() => {
    const u = getUser()
    if (!u) return
    setUser(u)
    seedSocialDemoData()
    const p = initSocialProfile(u)
    setProfile(p)
    setPosts(getSocialPosts())
    setMounted(true)
  }, [])

  const loadComments = useCallback((postId: string) => {
    const c = getPostComments(postId)
    setCommentsMap(prev => ({ ...prev, [postId]: c }))
  }, [])

  const handleOpenComments = (postId: string) => {
    if (openCommentsPostId === postId) {
      setOpenCommentsPostId(null)
      return
    }
    loadComments(postId)
    setOpenCommentsPostId(postId)
  }

  const handleReact = (postId: string, emoji: string) => {
    if (!user) return
    toggleReaction(postId, emoji, user.id)
    setPosts(getSocialPosts())
  }

  const handlePost = (post: RoastCard) => {
    addSocialPost(post)
    setPosts(getSocialPosts())
  }

  const filteredPosts = useMemo(() => {
    const all = [...posts]
    switch (activeTab) {
      case "trending":
        return all.sort((a, b) => {
          const aScore = getTotalReactions(a) + a.shareCount * 2
          const bScore = getTotalReactions(b) + b.shareCount * 2
          return bScore - aScore
        })
      case "latest":
        return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      case "top":
        return all.sort((a, b) => b.disciplineScore - a.disciplineScore)
      case "brutal":
        return all.filter(p => p.roastLevel === "brutal").sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      default:
        return all
    }
  }, [posts, activeTab])

  // Comment counts
  const commentCounts = useMemo(() => {
    // We need to count from stored comments
    const counts: Record<string, number> = {}
    posts.forEach(p => {
      counts[p.id] = getPostComments(p.id).length
    })
    return counts
  }, [posts])

  if (!mounted || !user || !profile) {
    return (
      <div className="space-y-5">
        <div className="h-10 w-48 bg-[var(--color-secondary)] rounded-xl animate-pulse" />
        <div className="h-56 bg-[var(--color-secondary)] rounded-2xl animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-48 bg-[var(--color-secondary)] rounded-2xl animate-pulse" />)}
        </div>
      </div>
    )
  }

  const tabs: { id: FeedTab; label: string; icon: React.ElementType }[] = [
    { id: "trending", label: "Trending", icon: TrendingUp },
    { id: "latest", label: "Latest", icon: Clock },
    { id: "top", label: "Top Scores", icon: Trophy },
    { id: "brutal", label: "Most Brutal", icon: Skull },
  ]

  return (
    <motion.div className="space-y-6 overflow-x-hidden" initial="hidden" animate="visible" variants={stagger}>
      {/* ─── Header ─── */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-orange-400 uppercase tracking-[0.2em] mb-1">Community</p>
          <h1 className="text-2xl sm:text-[1.75rem] font-bold tracking-tight flex items-center gap-2">
            🔥 Roast Social
          </h1>
          <p className="text-[13px] text-[var(--color-muted-foreground)] mt-1">
            Share your financial roasts. Compete. Go viral.
          </p>
        </div>
        <div className="flex gap-3 self-start sm:self-auto">
          <Link href="/social/leaderboard"
            className="btn-secondary px-4 py-2.5 rounded-xl text-[13px] font-semibold flex items-center gap-2">
            <Trophy className="w-4 h-4" /> Leaderboard
          </Link>
          <button onClick={() => setShowCreateModal(true)}
            className="btn-primary px-5 py-2.5 rounded-xl text-[13px] font-semibold flex items-center gap-2 share-pulse">
            <Plus className="w-4 h-4" /> Post Roast
          </button>
        </div>
      </motion.div>

      {/* ─── Quick Stats ─── */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="stat-card text-center">
          <p className="text-[11px] text-[var(--color-muted-foreground)] uppercase tracking-[0.15em] font-semibold mb-2">Total Roasts</p>
          <p className="text-[1.5rem] font-bold">{posts.length}</p>
        </div>
        <Link href="/social/profile" className="stat-card text-center group cursor-pointer">
          <p className="text-[11px] text-[var(--color-muted-foreground)] uppercase tracking-[0.15em] font-semibold mb-2">Your Profile</p>
          <p className="text-[1.5rem] font-bold gradient-text group-hover:opacity-80 transition-opacity">
            {posts.filter(p => p.userId === user.id).length} posts
          </p>
        </Link>
        <Link href="/social/leaderboard" className="stat-card text-center group cursor-pointer">
          <p className="text-[11px] text-[var(--color-muted-foreground)] uppercase tracking-[0.15em] font-semibold mb-2">Leaderboard</p>
          <p className="text-[1.5rem] font-bold">
            <Trophy className="w-5 h-5 text-amber-400 inline" />
          </p>
        </Link>
      </motion.div>

      {/* ─── Feed Tabs ─── */}
      <motion.div variants={fadeUp} className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {tabs.map(tab => (
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

      {/* ─── Feed ─── */}
      <motion.div variants={stagger} className="space-y-4">
        {filteredPosts.map(post => (
          <div key={post.id}>
            <RoastPostCard
              post={post}
              user={user}
              onReact={handleReact}
              onOpenComments={handleOpenComments}
              commentCount={commentCounts[post.id] || 0}
            />
            <AnimatePresence>
              {openCommentsPostId === post.id && (
                <CommentsSection
                  postId={post.id}
                  user={user}
                  profile={profile}
                  comments={commentsMap[post.id] || []}
                  onClose={() => setOpenCommentsPostId(null)}
                />
              )}
            </AnimatePresence>
          </div>
        ))}
      </motion.div>

      {filteredPosts.length === 0 && (
        <motion.div variants={fadeUp} className="glass-card rounded-2xl p-12 text-center">
          <Flame className="w-10 h-10 text-orange-400 mx-auto mb-3 opacity-40" />
          <p className="text-[var(--color-muted-foreground)]">No posts in this category yet. Be the first!</p>
        </motion.div>
      )}

      {/* ═══════════════════════════════════════════════════════
          🔥 SPECTACULAR BOTTOM SECTION 🔥
          ═══════════════════════════════════════════════════════ */}

      {/* ─── Animated Fire Divider ─── */}
      <motion.div variants={fadeUp} className="py-4">
        <div className="bottom-glow-line" />
      </motion.div>

      {/* ─── Scrolling Community Ticker ─── */}
      <motion.div variants={fadeUp} className="overflow-hidden rounded-2xl py-3">
        <div className="ticker-track">
          {[
            { emoji: "🔥", text: "BudgetBuster just got roasted — Score: 23/100" },
            { emoji: "💀", text: "SaveQueen hit 98/100 discipline — LEGEND" },
            { emoji: "😭", text: "$847 wasted on Uber Eats this month" },
            { emoji: "🏆", text: "New #1 on the Leaderboard!" },
            { emoji: "💸", text: "Anonymous dropped a BRUTAL roast" },
            { emoji: "🎯", text: "12 new roasts posted today" },
            { emoji: "⚡", text: "Community saved $12,400 this week" },
            { emoji: "👀", text: "3 people just shared their shame" },
            { emoji: "🔥", text: "BudgetBuster just got roasted — Score: 23/100" },
            { emoji: "💀", text: "SaveQueen hit 98/100 discipline — LEGEND" },
            { emoji: "😭", text: "$847 wasted on Uber Eats this month" },
            { emoji: "🏆", text: "New #1 on the Leaderboard!" },
            { emoji: "💸", text: "Anonymous dropped a BRUTAL roast" },
            { emoji: "🎯", text: "12 new roasts posted today" },
            { emoji: "⚡", text: "Community saved $12,400 this week" },
            { emoji: "👀", text: "3 people just shared their shame" },
          ].map((item, i) => (
            <div key={i} className="ticker-item">
              <span>{item.emoji}</span>
              <span className="text-[var(--color-foreground)]/80">{item.text}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ─── Hall of Shame Spotlight ─── */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500/20 to-orange-500/10 flex items-center justify-center">
            <Skull className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <h3 className="font-bold text-[15px]">Hall of Shame</h3>
            <p className="text-[11px] text-[var(--color-muted-foreground)]">This week&apos;s most roasted spenders</p>
          </div>
          <div className="ml-auto">
            <span className="glow-badge glow-badge-skull">
              <Flame className="w-3 h-3" /> LIVE
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              rank: "💀",
              name: "CoffeeAddict99",
              score: 12,
              wasted: 1247,
              category: "Coffee & Dining",
              badge: "Worst Spender",
              gradient: 2,
            },
            {
              rank: "😱",
              name: "SubKing",
              score: 28,
              wasted: 890,
              category: "Subscriptions",
              badge: "Sub Overlord",
              gradient: 5,
            },
            {
              rank: "🤡",
              name: "ImpulseBuyer",
              score: 31,
              wasted: 673,
              category: "Shopping",
              badge: "No Self-Control",
              gradient: 8,
            },
          ].map((shamer, i) => (
            <motion.div
              key={i}
              className="shame-card"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <Avatar name={shamer.name} gradient={shamer.gradient} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[13px] truncate">{shamer.name}</p>
                  <span className="glow-badge glow-badge-fire text-[10px] py-0.5 px-2 mt-1">
                    {shamer.badge}
                  </span>
                </div>
                <span className="text-2xl">{shamer.rank}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--color-background)]/50 mb-2">
                <div>
                  <p className="text-[10px] text-[var(--color-muted-foreground)] uppercase tracking-wider">Wasted</p>
                  <p className="text-[18px] font-bold text-red-400 counter-glow">${shamer.wasted}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-[var(--color-muted-foreground)] uppercase tracking-wider">Score</p>
                  <MiniScoreRing score={shamer.score} size={38} />
                </div>
              </div>
              <p className="text-[11px] text-[var(--color-muted-foreground)]">
                <AlertTriangle className="w-3 h-3 inline text-orange-400 mr-1" />
                Top waste: <span className="text-[var(--color-foreground)]/80 font-semibold">{shamer.category}</span>
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ─── 🔥 MEGA CTA FIRE BANNER 🔥 ─── */}
      <motion.div
        variants={fadeUp}
        className="roast-cta-banner p-5 sm:p-10 text-center overflow-hidden"
      >
        {/* Fire Particles */}
        <div className="fire-particles">
          {[
            { l: 5, b: 12, s: 5, d: 3.2, dl: 0.4, bl: 0.2, sh: 7 },
            { l: 15, b: 8, s: 4, d: 4.1, dl: 1.2, bl: 0.8, sh: 5 },
            { l: 22, b: 20, s: 7, d: 2.5, dl: 2.8, bl: 0.1, sh: 10 },
            { l: 33, b: 5, s: 3, d: 3.8, dl: 0.9, bl: 0.6, sh: 4 },
            { l: 41, b: 18, s: 6, d: 4.5, dl: 3.1, bl: 0, sh: 8 },
            { l: 50, b: 3, s: 8, d: 2.9, dl: 1.7, bl: 0.4, sh: 11 },
            { l: 58, b: 25, s: 4, d: 3.6, dl: 0.2, bl: 0.9, sh: 6 },
            { l: 65, b: 10, s: 5, d: 4.3, dl: 2.4, bl: 0.3, sh: 9 },
            { l: 72, b: 15, s: 7, d: 2.7, dl: 3.5, bl: 0.7, sh: 5 },
            { l: 80, b: 7, s: 3, d: 3.4, dl: 1.0, bl: 0.5, sh: 7 },
            { l: 87, b: 22, s: 6, d: 4.8, dl: 2.0, bl: 0, sh: 10 },
            { l: 12, b: 28, s: 4, d: 3.1, dl: 3.8, bl: 0.8, sh: 4 },
            { l: 28, b: 2, s: 8, d: 2.3, dl: 0.6, bl: 0.2, sh: 12 },
            { l: 45, b: 16, s: 5, d: 4.0, dl: 2.6, bl: 0.6, sh: 6 },
            { l: 55, b: 9, s: 3, d: 3.7, dl: 1.4, bl: 0.1, sh: 8 },
            { l: 68, b: 24, s: 7, d: 2.6, dl: 3.2, bl: 0.9, sh: 5 },
            { l: 75, b: 4, s: 6, d: 4.2, dl: 0.8, bl: 0.3, sh: 9 },
            { l: 83, b: 19, s: 4, d: 3.5, dl: 2.2, bl: 0.7, sh: 7 },
            { l: 90, b: 11, s: 5, d: 2.8, dl: 1.6, bl: 0.4, sh: 11 },
            { l: 38, b: 26, s: 8, d: 4.6, dl: 3.4, bl: 0, sh: 6 },
          ].map((p, i) => (
            <div
              key={i}
              className="fire-particle"
              style={{
                left: `${p.l}%`,
                bottom: `${p.b}%`,
                width: `${p.s}px`,
                height: `${p.s}px`,
                background: ['#f97316', '#ef4444', '#ec4899', '#fbbf24', '#f59e0b'][i % 5],
                ['--duration' as string]: `${p.d}s`,
                ['--delay' as string]: `${p.dl}s`,
                filter: `blur(${p.bl}px)`,
                boxShadow: `0 0 ${p.sh}px currentColor`,
              }}
            />
          ))}
        </div>

        {/* Floating Emojis */}
        {['🔥', '💀', '💸', '😭', '🏆', '⚡', '🎯', '👑'].map((emoji, i) => (
          <span
            key={i}
            className="floating-emoji text-xl sm:text-2xl"
            style={{
              left: `${8 + i * 12}%`,
              bottom: '10%',
              ['--duration' as string]: `${3 + i * 0.4}s`,
              ['--delay' as string]: `${i * 0.6}s`,
            }}
          >
            {emoji}
          </span>
        ))}

        {/* Content */}
        <div className="relative z-10">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="heartbeat text-5xl sm:text-6xl block mb-4">🔥</span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
              <span className="gradient-text-fire">Ready to Get Roasted?</span>
            </h2>
            <p className="text-[14px] sm:text-[15px] text-[var(--color-foreground)]/60 mb-6 max-w-md mx-auto leading-relaxed">
              Share your spending shame with the community. The more brutal the roast,
              the more viral you go. <span className="streak-fire-text font-bold">No mercy.</span>
            </p>
          </motion.div>

          {/* Mega CTA Button */}
          <motion.button
            onClick={() => setShowCreateModal(true)}
            className="mega-cta-btn inline-flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            <Flame className="w-5 h-5" />
            <span>Post Your Roast Now</span>
            <Sparkles className="w-5 h-5" />
          </motion.button>

          {/* Sub actions */}
          <div className="flex items-center justify-center gap-4 mt-5">
            <Link href="/social/leaderboard" className="flex items-center gap-1.5 text-[12px] font-semibold text-amber-400/80 hover:text-amber-400 transition-colors">
              <Trophy className="w-3.5 h-3.5" />
              View Leaderboard
              <ArrowRight className="w-3 h-3" />
            </Link>
            <span className="text-[var(--color-border)]">|</span>
            <Link href="/social/profile" className="flex items-center gap-1.5 text-[12px] font-semibold text-orange-400/80 hover:text-orange-400 transition-colors">
              <Users className="w-3.5 h-3.5" />
              Your Profile
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ─── Community Heartbeat Stats ─── */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Flame, label: "Roasts Today", value: "47", color: "text-orange-400", glow: "from-orange-500/15 to-red-500/5" },
          { icon: Zap, label: "Reactions", value: "1.2K", color: "text-yellow-400", glow: "from-yellow-500/15 to-amber-500/5" },
          { icon: Target, label: "Avg Score", value: "42", color: "text-red-400", glow: "from-red-500/15 to-pink-500/5" },
          { icon: Heart, label: "Community", value: "3.8K", color: "text-pink-400", glow: "from-pink-500/15 to-orange-500/5" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            className="glass-card rounded-xl p-4 text-center group cursor-default"
            whileHover={{ y: -3, borderColor: "rgba(249, 115, 22, 0.3)" }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.glow} flex items-center justify-center mx-auto mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className={`text-xl font-black counter-glow ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] text-[var(--color-muted-foreground)] uppercase tracking-[0.15em] font-semibold mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* ─── Bottom Fire Ambient ─── */}
      <motion.div variants={fadeUp} className="pt-2 pb-4">
        <div className="bottom-glow-line mb-6" />
        <div className="flex items-center justify-center gap-2 text-[10px] sm:text-[11px] text-[var(--color-muted-foreground)] text-center">
          <Flame className="w-3.5 h-3.5 text-orange-400/60 heartbeat shrink-0" />
          <span>WalletRoast Social — Where financial shame becomes entertainment</span>
          <Flame className="w-3.5 h-3.5 text-orange-400/60 heartbeat shrink-0" />
        </div>
      </motion.div>

      {/* ─── Create Post Modal ─── */}
      <AnimatePresence>
        {showCreateModal && (
          <CreatePostModal
            user={user}
            profile={profile}
            onClose={() => setShowCreateModal(false)}
            onPost={handlePost}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
