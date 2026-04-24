export type RoastLevel = "soft" | "direct" | "brutal"
export type RecurringType = "daily" | "weekly" | "monthly" | null
export type InsightSeverity = "info" | "warning" | "danger" | "positive"
export type InsightType = "food_overspend" | "subscription_drain" | "low_balance" | "shopping_spike" | "savings_achiever" | "budget_discipline" | "no_tracking" | "impulse_pattern"
export type SubscriptionPlan = "free" | "pro"
export type EmploymentStatus = "student" | "salaried" | "freelancer" | "business_owner" | "unemployed" | "retired" | "other"
export type HousingStatus = "renting" | "own_home" | "mortgage" | "living_with_family" | "other"
export type FinancialGoal = "save_more" | "pay_debt" | "invest" | "emergency_fund" | "buy_home" | "retirement" | "travel" | "education"
export type PaymentMethod = "cash" | "debit_card" | "credit_card" | "mobile_payment" | "mixed"

export interface User {
  id: string
  clerkId?: string
  name: string
  email: string
  phone?: string
  profilePhoto?: string
  bio?: string
  location?: string
  dateOfBirth?: string
  twoFactorEnabled?: boolean
  twoFactorVerified?: boolean
  currency: string
  monthlyIncome: number
  roastLevel: RoastLevel
  savingsGoal: number
  subscriptionPlan: SubscriptionPlan
  onboardingComplete: boolean
  // Financial profile
  employmentStatus?: EmploymentStatus
  industry?: string
  housingStatus?: HousingStatus
  financialGoal?: FinancialGoal
  monthlyExpenses?: number
  dependents?: number
  hasEmergencyFund?: boolean
  paymentMethod?: PaymentMethod
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  userId: string
  name: string
  icon: string
  color: string
  isDefault: boolean
}

export interface Budget {
  id: string
  userId: string
  categoryId: string
  monthlyLimit: number
  category?: Category
}

export interface Expense {
  id: string
  userId: string
  categoryId: string
  amount: number
  note: string
  expenseDate: Date | string
  isRecurring: boolean
  recurringType: RecurringType
  category?: Category
}

export interface Goal {
  id: string
  userId: string
  title: string
  targetAmount: number
  savedAmount: number
  deadline: Date | string
}

export interface Insight {
  id: string
  userId: string
  type: InsightType
  severity: InsightSeverity
  title: string
  message: string
  generatedForDate: Date | string
}

export interface Notification {
  id: string
  userId: string
  title: string
  body: string
  readStatus: boolean
  createdAt: Date
}

export interface DashboardData {
  totalSpent: number
  remainingBalance: number
  moneyWasted: number
  savingsProgress: number
  disciplineScore: number
  insights: Insight[]
  categoryBreakdown: CategorySpending[]
  projection: ProjectionData
}

export interface CategorySpending {
  category: Category
  spent: number
  budget: number
  percentage: number
}

export interface ProjectionData {
  projectedBalance: number
  dailyAverage: number
  message: string
  isPositive: boolean
}

export const DEFAULT_CATEGORIES: Omit<Category, "id" | "userId">[] = [
  { name: "Food & Dining", icon: "🍔", color: "#f97316", isDefault: true },
  { name: "Transportation", icon: "🚕", color: "#3b82f6", isDefault: true },
  { name: "Shopping", icon: "🛍️", color: "#ec4899", isDefault: true },
  { name: "Entertainment", icon: "🎬", color: "#f97316", isDefault: true },
  { name: "Subscriptions", icon: "📺", color: "#6366f1", isDefault: true },
  { name: "Bills & Utilities", icon: "💡", color: "#14b8a6", isDefault: true },
  { name: "Health", icon: "💊", color: "#22c55e", isDefault: true },
  { name: "Coffee", icon: "☕", color: "#a16207", isDefault: true },
  { name: "Groceries", icon: "🛒", color: "#65a30d", isDefault: true },
  { name: "Other", icon: "📦", color: "#6b7280", isDefault: true },
]

export const QUICK_ADD_PRESETS = [
  { name: "Coffee", icon: "☕", defaultAmount: 5, categoryName: "Coffee" },
  { name: "Taxi", icon: "🚕", defaultAmount: 15, categoryName: "Transportation" },
  { name: "Food", icon: "🍔", defaultAmount: 12, categoryName: "Food & Dining" },
  { name: "Shopping", icon: "🛍️", defaultAmount: 50, categoryName: "Shopping" },
  { name: "Subscription", icon: "📺", defaultAmount: 10, categoryName: "Subscriptions" },
]

// ─── Social Types ───
export interface RoastCard {
  id: string
  userId: string
  username: string
  avatarGradient: number
  disciplineScore: number
  biggestWasteCategory: string
  biggestWasteIcon: string
  wastedAmount: number
  roastMessage: string
  roastLevel: RoastLevel
  streak: number
  isAnonymous: boolean
  isPublic: boolean
  commentsDisabled: boolean
  createdAt: string
  reactions: Record<string, string[]>
  reactionsJson?: string
  shareCount: number
}

export interface SocialComment {
  id: string
  postId: string
  userId: string
  username: string
  avatarGradient: number
  text: string
  createdAt: string
  reactions: Record<string, string[]>
  reactionsJson?: string
  parentId: string | null
}

export interface SocialProfile {
  userId: string
  displayName: string
  bio: string
  avatarGradient: number
  score: number
  streak: number
  badges: string[]
  badgesJson?: string
  postCount: number
}

export type LeaderboardCategory = "discipline" | "comeback" | "lowest_waste" | "viral" | "streak"

export const SOCIAL_REACTIONS = ["🔥", "💀", "😭", "👏", "😬", "🧠", "💸"]

export const SOCIAL_BADGES: { id: string; icon: string; label: string; description: string }[] = [
  { id: "first_roast", icon: "🔥", label: "First Roast", description: "Posted your first roast card" },
  { id: "brutal_survivor", icon: "💀", label: "Brutal Survivor", description: "Survived a brutal-mode week" },
  { id: "discipline_king", icon: "📊", label: "Discipline King", description: "Score above 90 for a week" },
  { id: "leaderboard_climber", icon: "🏆", label: "Leaderboard Climber", description: "Reached top 5 on any leaderboard" },
  { id: "streak_warrior", icon: "🔄", label: "3-Week Streak", description: "Posted roasts 3 weeks in a row" },
  { id: "social_butterfly", icon: "💬", label: "Social Butterfly", description: "Left 10+ comments" },
]
