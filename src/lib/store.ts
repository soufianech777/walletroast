// Client-side store using localStorage for demo mode
// In production, this would be replaced by Prisma + PostgreSQL calls

import { User, Category, Budget, Expense, Goal, Notification, DEFAULT_CATEGORIES, RoastLevel, RoastCard, SocialComment, SocialProfile } from "./types"
import { generateId } from "./utils"

const STORAGE_KEYS = {
  USER: "walletroast_user",
  CATEGORIES: "walletroast_categories",
  BUDGETS: "walletroast_budgets",
  EXPENSES: "walletroast_expenses",
  GOALS: "walletroast_goals",
  INSIGHTS: "walletroast_insights",
  NOTIFICATIONS: "walletroast_notifications",
  SOCIAL_POSTS: "walletroast_social_posts",
  SOCIAL_COMMENTS: "walletroast_social_comments",
  SOCIAL_PROFILE: "walletroast_social_profile",
}

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : fallback
  } catch {
    return fallback
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(value))
}

// User
export function getUser(): User | null {
  const user = getItem<User | null>(STORAGE_KEYS.USER, null)
  // Auto-upgrade to pro for demo
  if (user && user.subscriptionPlan !== "pro") {
    user.subscriptionPlan = "pro"
    setItem(STORAGE_KEYS.USER, user)
  }
  return user
}

export function saveUser(user: User): void {
  setItem(STORAGE_KEYS.USER, user)
}

export function createDefaultUser(data: {
  name: string
  email: string
  currency: string
  monthlyIncome: number
  roastLevel: RoastLevel
  savingsGoal: number
}): User {
  const user: User = {
    id: generateId(),
    name: data.name,
    email: data.email,
    currency: data.currency,
    monthlyIncome: data.monthlyIncome,
    roastLevel: data.roastLevel,
    savingsGoal: data.savingsGoal,
    subscriptionPlan: "pro",
    onboardingComplete: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  saveUser(user)
  
  // Create default categories
  const categories = DEFAULT_CATEGORIES.map(c => ({
    ...c,
    id: generateId(),
    userId: user.id,
  }))
  setItem(STORAGE_KEYS.CATEGORIES, categories)
  
  // Create default budgets
  const defaultBudgets: Budget[] = categories.map(c => ({
    id: generateId(),
    userId: user.id,
    categoryId: c.id,
    monthlyLimit: Math.round(data.monthlyIncome * 0.1),
  }))
  setItem(STORAGE_KEYS.BUDGETS, defaultBudgets)
  
  return user
}

// Categories
export function getCategories(): Category[] {
  return getItem<Category[]>(STORAGE_KEYS.CATEGORIES, [])
}

export function saveCategories(categories: Category[]): void {
  setItem(STORAGE_KEYS.CATEGORIES, categories)
}

export function addCategory(category: Omit<Category, "id">): Category {
  const categories = getCategories()
  const newCat = { ...category, id: generateId() }
  categories.push(newCat)
  saveCategories(categories)
  return newCat
}

// Budgets
export function getBudgets(): Budget[] {
  const budgets = getItem<Budget[]>(STORAGE_KEYS.BUDGETS, [])
  const categories = getCategories()
  return budgets.map(b => ({
    ...b,
    category: categories.find(c => c.id === b.categoryId),
  }))
}

export function saveBudgets(budgets: Budget[]): void {
  setItem(STORAGE_KEYS.BUDGETS, budgets)
}

export function updateBudget(categoryId: string, monthlyLimit: number): void {
  const budgets = getBudgets()
  const idx = budgets.findIndex(b => b.categoryId === categoryId)
  if (idx !== -1) {
    budgets[idx].monthlyLimit = monthlyLimit
  } else {
    const user = getUser()
    budgets.push({
      id: generateId(),
      userId: user?.id || "",
      categoryId,
      monthlyLimit,
    })
  }
  saveBudgets(budgets)
}

// Expenses
export function getExpenses(): Expense[] {
  const expenses = getItem<Expense[]>(STORAGE_KEYS.EXPENSES, [])
  const categories = getCategories()
  return expenses.map(e => ({
    ...e,
    category: categories.find(c => c.id === e.categoryId),
  }))
}

export function getCurrentMonthExpenses(): Expense[] {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  return getExpenses().filter(e => new Date(e.expenseDate) >= startOfMonth)
}

export function addExpense(data: Omit<Expense, "id" | "userId" | "category">): Expense {
  const expenses = getItem<Expense[]>(STORAGE_KEYS.EXPENSES, [])
  const user = getUser()
  const expense: Expense = {
    ...data,
    id: generateId(),
    userId: user?.id || "",
  }
  expenses.push(expense)
  setItem(STORAGE_KEYS.EXPENSES, expenses)
  return expense
}

export function updateExpense(id: string, data: Partial<Expense>): void {
  const expenses = getItem<Expense[]>(STORAGE_KEYS.EXPENSES, [])
  const idx = expenses.findIndex(e => e.id === id)
  if (idx !== -1) {
    expenses[idx] = { ...expenses[idx], ...data }
    setItem(STORAGE_KEYS.EXPENSES, expenses)
  }
}

export function deleteExpense(id: string): void {
  const expenses = getItem<Expense[]>(STORAGE_KEYS.EXPENSES, [])
  setItem(STORAGE_KEYS.EXPENSES, expenses.filter(e => e.id !== id))
}

// Goals
export function getGoals(): Goal[] {
  return getItem<Goal[]>(STORAGE_KEYS.GOALS, [])
}

export function addGoal(data: Omit<Goal, "id" | "userId">): Goal {
  const goals = getGoals()
  const user = getUser()
  const goal: Goal = {
    ...data,
    id: generateId(),
    userId: user?.id || "",
  }
  goals.push(goal)
  setItem(STORAGE_KEYS.GOALS, goals)
  return goal
}

export function updateGoal(id: string, data: Partial<Goal>): void {
  const goals = getGoals()
  const idx = goals.findIndex(g => g.id === id)
  if (idx !== -1) {
    goals[idx] = { ...goals[idx], ...data }
    setItem(STORAGE_KEYS.GOALS, goals)
  }
}

export function deleteGoal(id: string): void {
  const goals = getGoals()
  setItem(STORAGE_KEYS.GOALS, goals.filter(g => g.id !== id))
}

// Notifications
export function getNotifications(): Notification[] {
  return getItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, [])
}

export function addNotification(title: string, body: string): void {
  const notifications = getNotifications()
  const user = getUser()
  notifications.unshift({
    id: generateId(),
    userId: user?.id || "",
    title,
    body,
    readStatus: false,
    createdAt: new Date(),
  })
  setItem(STORAGE_KEYS.NOTIFICATIONS, notifications.slice(0, 50))
}

export function markNotificationRead(id: string): void {
  const notifications = getNotifications()
  const idx = notifications.findIndex(n => n.id === id)
  if (idx !== -1) {
    notifications[idx].readStatus = true
    setItem(STORAGE_KEYS.NOTIFICATIONS, notifications)
  }
}

export function markAllNotificationsRead(): void {
  const notifications = getNotifications()
  setItem(STORAGE_KEYS.NOTIFICATIONS, notifications.map(n => ({ ...n, readStatus: true })))
}

// Seed demo data
export function seedDemoData(): void {
  const user = getUser()
  if (!user) return
  
  const categories = getCategories()
  const now = new Date()
  const expenses: Expense[] = []
  
  // Generate realistic demo expenses for the current month
  const demoExpenses = [
    { catName: "Food & Dining", amounts: [12, 8, 15, 22, 9, 18, 14, 11, 25, 7, 13, 19] },
    { catName: "Coffee", amounts: [5, 6, 5, 4, 5, 6, 5, 7, 5, 4] },
    { catName: "Transportation", amounts: [15, 12, 18, 8, 20, 15] },
    { catName: "Shopping", amounts: [45, 89, 32, 120] },
    { catName: "Subscriptions", amounts: [15, 12, 10, 8, 6] },
    { catName: "Entertainment", amounts: [25, 18, 35] },
    { catName: "Bills & Utilities", amounts: [85, 45, 60] },
    { catName: "Groceries", amounts: [55, 42, 68, 38] },
  ]
  
  demoExpenses.forEach(({ catName, amounts }) => {
    const cat = categories.find(c => c.name === catName)
    if (!cat) return
    amounts.forEach((amount, i) => {
      const day = Math.min(Math.max(1, now.getDate() - amounts.length + i + 1), now.getDate())
      expenses.push({
        id: generateId(),
        userId: user.id,
        categoryId: cat.id,
        amount,
        note: `${catName} expense`,
        expenseDate: new Date(now.getFullYear(), now.getMonth(), day).toISOString(),
        isRecurring: catName === "Subscriptions",
        recurringType: catName === "Subscriptions" ? "monthly" : null,
      })
    })
  })
  
  setItem(STORAGE_KEYS.EXPENSES, expenses)
}

// ─── Social Posts ───
export function getSocialPosts(): RoastCard[] {
  return getItem<RoastCard[]>(STORAGE_KEYS.SOCIAL_POSTS, [])
}

export function saveSocialPosts(posts: RoastCard[]): void {
  setItem(STORAGE_KEYS.SOCIAL_POSTS, posts)
}

export function addSocialPost(post: RoastCard): void {
  const posts = getSocialPosts()
  posts.unshift(post)
  saveSocialPosts(posts)
}

export function deleteSocialPost(id: string): void {
  saveSocialPosts(getSocialPosts().filter(p => p.id !== id))
}

export function toggleReaction(postId: string, emoji: string, userId: string): void {
  const posts = getSocialPosts()
  const post = posts.find(p => p.id === postId)
  if (!post) return
  if (!post.reactions[emoji]) post.reactions[emoji] = []
  const idx = post.reactions[emoji].indexOf(userId)
  if (idx >= 0) {
    post.reactions[emoji].splice(idx, 1)
    if (post.reactions[emoji].length === 0) delete post.reactions[emoji]
  } else {
    post.reactions[emoji].push(userId)
  }
  saveSocialPosts(posts)
}

export function incrementShareCount(postId: string): void {
  const posts = getSocialPosts()
  const post = posts.find(p => p.id === postId)
  if (post) { post.shareCount++; saveSocialPosts(posts) }
}

// ─── Social Comments ───
export function getSocialComments(): SocialComment[] {
  return getItem<SocialComment[]>(STORAGE_KEYS.SOCIAL_COMMENTS, [])
}

export function getPostComments(postId: string): SocialComment[] {
  return getSocialComments().filter(c => c.postId === postId)
}

export function addSocialComment(comment: SocialComment): void {
  const comments = getSocialComments()
  comments.unshift(comment)
  setItem(STORAGE_KEYS.SOCIAL_COMMENTS, comments)
}

export function deleteSocialComment(id: string): void {
  setItem(STORAGE_KEYS.SOCIAL_COMMENTS, getSocialComments().filter(c => c.id !== id))
}

export function toggleCommentReaction(commentId: string, emoji: string, userId: string): void {
  const comments = getSocialComments()
  const comment = comments.find(c => c.id === commentId)
  if (!comment) return
  if (!comment.reactions[emoji]) comment.reactions[emoji] = []
  const idx = comment.reactions[emoji].indexOf(userId)
  if (idx >= 0) {
    comment.reactions[emoji].splice(idx, 1)
    if (comment.reactions[emoji].length === 0) delete comment.reactions[emoji]
  } else {
    comment.reactions[emoji].push(userId)
  }
  setItem(STORAGE_KEYS.SOCIAL_COMMENTS, comments)
}

// ─── Social Profile ───
export function getSocialProfile(): SocialProfile | null {
  return getItem<SocialProfile | null>(STORAGE_KEYS.SOCIAL_PROFILE, null)
}

export function saveSocialProfile(profile: SocialProfile): void {
  setItem(STORAGE_KEYS.SOCIAL_PROFILE, profile)
}

export function initSocialProfile(user: User): SocialProfile {
  const existing = getSocialProfile()
  if (existing) return existing
  const profile: SocialProfile = {
    userId: user.id,
    displayName: user.name,
    bio: "",
    avatarGradient: Math.floor(Math.random() * 18),
    score: 0,
    streak: 0,
    badges: [],
    postCount: 0,
  }
  saveSocialProfile(profile)
  return profile
}

// ─── Seed Social Demo Data ───
export async function seedSocialDemoData(): Promise<void> {
  const existing = getSocialPosts()
  if (existing.length > 0) return

  // Import dynamically to avoid circular deps
  const { generateDemoPosts, generateDemoComments } = await import("./engines/roast-social-engine")
  const posts = generateDemoPosts()
  const comments = generateDemoComments(posts)
  saveSocialPosts(posts)
  setItem(STORAGE_KEYS.SOCIAL_COMMENTS, comments)
}
