import { RoastCard, SocialComment, RoastLevel, SOCIAL_REACTIONS } from "../types"
import { generateId } from "../utils"

// ─── Demo usernames & data ───
const DEMO_USERS = [
  { name: "BudgetBoss", gradient: 0 },
  { name: "SpendQueen", gradient: 1 },
  { name: "CashChaos", gradient: 2 },
  { name: "FrugalVibes", gradient: 3 },
  { name: "WasteWatcher", gradient: 4 },
  { name: "DebtDodger", gradient: 5 },
  { name: "SavingsNinja", gradient: 6 },
  { name: "CoffeeDrain", gradient: 7 },
  { name: "ImpulsePro", gradient: 8 },
  { name: "BrokeBut💅", gradient: 9 },
  { name: "NoMoreUber", gradient: 10 },
  { name: "SubscriptionSlave", gradient: 11 },
  { name: "MealPrepKing", gradient: 12 },
  { name: "GymSkipper", gradient: 13 },
  { name: "LateNightSnacker", gradient: 14 },
  { name: "TaxiAddict", gradient: 15 },
  { name: "PizzaEveryDay", gradient: 16 },
  { name: "CryptoRegret", gradient: 17 },
]

const WASTE_CATEGORIES = [
  { name: "Food Delivery", icon: "🍔" },
  { name: "Coffee", icon: "☕" },
  { name: "Shopping", icon: "🛍️" },
  { name: "Subscriptions", icon: "📺" },
  { name: "Transportation", icon: "🚕" },
  { name: "Entertainment", icon: "🎬" },
  { name: "Late Night Snacks", icon: "🌮" },
  { name: "Impulse Buys", icon: "💳" },
]

const ROAST_MESSAGES: Record<RoastLevel, string[]> = {
  soft: [
    "Not my best week, but I'll bounce back 💪",
    "Could've been worse... could've been better too.",
    "Baby steps toward discipline. We'll get there.",
    "This week was a learning experience. Expensive, but educational.",
    "My wallet is gently weeping, but it still trusts me.",
    "Okay, maybe I didn't need ALL of those purchases...",
  ],
  direct: [
    "This week was expensive for no reason.",
    "I overspent and I know it. No excuses.",
    "My budget plan lasted exactly 2 days.",
    "Another week, another budget blown.",
    "I clearly don't learn from my mistakes yet.",
    "The numbers don't lie. I need to fix this.",
  ],
  brutal: [
    "I financially violated myself this week.",
    "My bank account filed a restraining order.",
    "I spent like I was allergic to money.",
    "This week was a masterclass in financial self-destruction.",
    "If wasting money was a sport, I'd be Olympic gold.",
    "My wallet needs therapy after this week.",
  ],
}

const DEMO_COMMENTS = [
  "Been there 😭 next week will be better!",
  "This is painfully relatable 💀",
  "How do you even spend that much on coffee??",
  "Respect for posting this honestly 🔥",
  "I'm in this post and I don't like it",
  "At least you're tracking it! That's step 1",
  "Bruh... same energy over here",
  "Your wallet called. It wants a divorce.",
  "This is the accountability I needed to see",
  "we're all broke together 🤝",
  "Unsubscribe from half those services fr",
  "The roast message took me OUT 😭😭",
  "King/Queen of self-awareness right here",
  "Post this on Twitter and watch it go viral 🔥",
  "This score is criminal. Fix it next week!",
]

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomBetween(min: number, max: number): number {
  return Math.round(min + Math.random() * (max - min))
}

function generateRandomReactions(): Record<string, string[]> {
  const reactions: Record<string, string[]> = {}
  const numReactionTypes = randomBetween(2, 5)
  const emojis = [...SOCIAL_REACTIONS].sort(() => Math.random() - 0.5).slice(0, numReactionTypes)

  emojis.forEach(emoji => {
    const count = randomBetween(1, 25)
    reactions[emoji] = Array.from({ length: count }, (_, i) => `demo_user_${i}`)
  })

  return reactions
}

function daysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(randomBetween(8, 22), randomBetween(0, 59))
  return d.toISOString()
}

// ─── Generate Demo Posts ───
export function generateDemoPosts(): RoastCard[] {
  const posts: RoastCard[] = []

  DEMO_USERS.forEach((user, i) => {
    const level = randomItem<RoastLevel>(["soft", "direct", "brutal"])
    const waste = randomItem(WASTE_CATEGORIES)
    const score = randomBetween(15, 95)
    const wastedAmount = randomBetween(30, 800)

    posts.push({
      id: `demo_post_${i}`,
      userId: `demo_user_${i}`,
      username: user.name,
      avatarGradient: user.gradient,
      disciplineScore: score,
      biggestWasteCategory: waste.name,
      biggestWasteIcon: waste.icon,
      wastedAmount,
      roastMessage: randomItem(ROAST_MESSAGES[level]),
      roastLevel: level,
      streak: randomBetween(0, 12),
      isAnonymous: Math.random() < 0.15,
      isPublic: true,
      commentsDisabled: Math.random() < 0.1,
      createdAt: daysAgo(randomBetween(0, 14)),
      reactions: generateRandomReactions(),
      shareCount: randomBetween(0, 45),
    })
  })

  return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

// ─── Generate Demo Comments ───
export function generateDemoComments(posts: RoastCard[]): SocialComment[] {
  const comments: SocialComment[] = []

  posts.forEach(post => {
    if (post.commentsDisabled) return
    const numComments = randomBetween(0, 5)
    for (let i = 0; i < numComments; i++) {
      const demoUser = randomItem(DEMO_USERS)
      comments.push({
        id: generateId(),
        postId: post.id,
        userId: `demo_user_${demoUser.gradient}`,
        username: demoUser.name,
        avatarGradient: demoUser.gradient,
        text: randomItem(DEMO_COMMENTS),
        createdAt: daysAgo(randomBetween(0, 7)),
        reactions: Math.random() > 0.5 ? { "🔥": Array.from({ length: randomBetween(1, 8) }, (_, j) => `u_${j}`) } : {},
        parentId: null,
      })
    }
  })

  return comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

// ─── Generate Roast Card from User Data ───
export function generateUserRoastCard(userData: {
  userId: string
  username: string
  avatarGradient: number
  disciplineScore: number
  categorySpending: { category: { name: string; icon: string }; spent: number; budget: number }[]
  roastLevel: RoastLevel
  isAnonymous: boolean
  commentsDisabled: boolean
}): RoastCard {
  const overBudget = userData.categorySpending
    .map(c => ({ ...c, overBy: Math.max(0, c.spent - c.budget) }))
    .filter(c => c.overBy > 0)
    .sort((a, b) => b.overBy - a.overBy)

  const biggestWaste = overBudget[0]
  const totalWasted = overBudget.reduce((s, c) => s + c.overBy, 0)

  return {
    id: generateId(),
    userId: userData.userId,
    username: userData.isAnonymous ? "Anonymous" : userData.username,
    avatarGradient: userData.avatarGradient,
    disciplineScore: userData.disciplineScore,
    biggestWasteCategory: biggestWaste?.category.name || "None",
    biggestWasteIcon: biggestWaste?.category.icon || "✅",
    wastedAmount: totalWasted,
    roastMessage: randomItem(ROAST_MESSAGES[userData.roastLevel]),
    roastLevel: userData.roastLevel,
    streak: 0,
    isAnonymous: userData.isAnonymous,
    isPublic: true,
    commentsDisabled: userData.commentsDisabled,
    createdAt: new Date().toISOString(),
    reactions: {},
    shareCount: 0,
  }
}

// ─── Leaderboard ───
export function generateLeaderboard(
  posts: RoastCard[],
  category: "discipline" | "comeback" | "lowest_waste" | "viral" | "streak"
): RoastCard[] {
  const sorted = [...posts]

  switch (category) {
    case "discipline":
      sorted.sort((a, b) => b.disciplineScore - a.disciplineScore)
      break
    case "comeback":
      sorted.sort((a, b) => {
        const aScore = a.disciplineScore + a.streak * 3
        const bScore = b.disciplineScore + b.streak * 3
        return bScore - aScore
      })
      break
    case "lowest_waste":
      sorted.sort((a, b) => a.wastedAmount - b.wastedAmount)
      break
    case "viral":
      sorted.sort((a, b) => {
        const aTotal = Object.values(a.reactions).reduce((s, r) => s + r.length, 0) + a.shareCount
        const bTotal = Object.values(b.reactions).reduce((s, r) => s + r.length, 0) + b.shareCount
        return bTotal - aTotal
      })
      break
    case "streak":
      sorted.sort((a, b) => b.streak - a.streak)
      break
  }

  return sorted.slice(0, 20)
}

// ─── Viral Triggers ───
export function getViralTriggers(userPosts: RoastCard[], allPosts: RoastCard[]): string[] {
  const triggers: string[] = []

  if (userPosts.length === 0) {
    triggers.push("🔥 Post your first roast and join the community!")
    return triggers
  }

  const latestPost = userPosts[0]
  const totalReactions = Object.values(latestPost.reactions).reduce((s, r) => s + r.length, 0)

  if (totalReactions > 10) {
    triggers.push(`🎉 Your roast got ${totalReactions} reactions! You're trending!`)
  }

  // Check leaderboard position
  const disciplineBoard = generateLeaderboard(allPosts, "discipline")
  const userRank = disciplineBoard.findIndex(p => p.userId === latestPost.userId)
  if (userRank >= 0 && userRank < 5) {
    triggers.push(`🏆 You're #${userRank + 1} on the Discipline leaderboard!`)
  }

  if (latestPost.streak >= 3) {
    triggers.push(`🔄 ${latestPost.streak}-week streak! You're on fire!`)
  }

  return triggers
}

// ─── Get total reaction count for a post ───
export function getTotalReactions(post: RoastCard): number {
  return Object.values(post.reactions).reduce((s, r) => s + r.length, 0)
}

// ─── Avatar gradients ───
export const AVATAR_GRADIENTS = [
  "from-orange-500 to-amber-600",
  "from-pink-500 to-rose-600",
  "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-amber-600",
  "from-red-500 to-pink-600",
  "from-indigo-500 to-blue-600",
  "from-teal-500 to-green-600",
  "from-rose-500 to-red-600",
  "from-sky-500 to-indigo-600",
  "from-lime-500 to-emerald-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-red-600",
  "from-cyan-500 to-teal-600",
  "from-yellow-500 to-amber-600",
  "from-amber-500 to-orange-600",
  "from-green-500 to-emerald-600",
  "from-orange-600 to-red-600",
]
