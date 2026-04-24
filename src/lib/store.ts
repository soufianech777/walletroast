"use client";

import { User, Category, Budget, Expense, Goal, Notification, RoastCard, SocialComment, SocialProfile } from "./types";
import * as actions from "./actions";
import { generateId } from "./utils";

// Memory State
const STATE = {
  user: null as User | null,
  categories: [] as Category[],
  budgets: [] as Budget[],
  expenses: [] as Expense[],
  goals: [] as Goal[],
  posts: [] as RoastCard[],
  comments: [] as SocialComment[],
  profile: null as SocialProfile | null,
  notifications: [] as Notification[],
};

let _initialized = false;
let _initPromise: Promise<void> | null = null;
let subscribers: (() => void)[] = [];

function notify() {
  subscribers.forEach(cb => cb());
}

export function subscribe(cb: () => void) {
  subscribers.push(cb);
  return () => { subscribers = subscribers.filter(v => v !== cb) };
}

export async function ensureStoreInitialized() {
  if (_initialized) return;
  if (!_initPromise) {
    _initPromise = (async () => {
      try {
        const u = await actions.getUser();
        STATE.user = u as User | null;
        if (u) {
          const [cat, exp, bdg, gls, pts, cmt, prf, notif] = await Promise.all([
            actions.getCategories(),
            actions.getExpenses(),
            actions.getBudgets(),
            actions.getGoals(),
            actions.getSocialPosts(),
            actions.getSocialComments(),
            actions.getSocialProfile(),
            actions.getNotifications()
          ]);
          STATE.categories = cat as Category[];
          STATE.expenses = exp as Expense[];
          STATE.budgets = bdg as Budget[];
          STATE.goals = gls as Goal[];
          STATE.posts = pts as RoastCard[];
          STATE.comments = cmt as SocialComment[];
          STATE.profile = prf as SocialProfile | null;
          STATE.notifications = notif as Notification[];
        }
        _initialized = true;
        notify();
      } catch (err) {
        console.error("Failed to initialize store", err);
      }
    })();
  }
  return _initPromise;
}

export function isStoreInitialized() {
  return _initialized;
}

// ─── Readers ───

export function getUser(): User | null { return STATE.user; }
export function getCategories(): Category[] { return STATE.categories; }
export function getBudgets(): Budget[] { return STATE.budgets; }
export function getExpenses(): Expense[] { return STATE.expenses; }
export function getCurrentMonthExpenses(): Expense[] {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return STATE.expenses.filter(e => new Date(e.expenseDate) >= startOfMonth);
}
export function getGoals(): Goal[] { return STATE.goals; }
export function getSocialPosts(): RoastCard[] { return STATE.posts; }
export function getSocialComments(): SocialComment[] { return STATE.comments; }
export function getPostComments(postId: string): SocialComment[] { return STATE.comments.filter(c => c.postId === postId); }
export function getSocialProfile(): SocialProfile | null { return STATE.profile; }
export function getNotifications(): Notification[] { return STATE.notifications; }


// ─── Writers (Optimistic + Async) ───

export function saveUser(user: User): void {
  STATE.user = user;
  actions.saveUserAction(user);
  notify();
}

export function createDefaultUser(data: { name: string, email: string, currency: string, monthlyIncome: number, roastLevel: string, savingsGoal: number }): User {
  const tempUser = { ...data, id: "temp-" + Date.now(), subscriptionPlan: "free", onboardingComplete: true } as User;
  STATE.user = tempUser;
  actions.createDefaultUser(data).then(real => {
    STATE.user = real as User;
    ensureStoreInitialized(); // refetch everything generated
  });
  notify();
  return tempUser;
}

export function saveCategories(categories: Category[]): void {
  STATE.categories = categories;
  notify();
}

export function addCategory(category: Omit<Category, "id" | "userId">): Category {
  const temp = { ...category, id: generateId(), userId: STATE.user?.id || "", isDefault: false } as Category;
  STATE.categories.push(temp);
  actions.addCategory(category).then(real => {
    const idx = STATE.categories.findIndex(c => c.id === temp.id);
    if (idx !== -1) {
      STATE.categories[idx] = real as Category;
      notify();
    }
  });
  notify();
  return temp;
}

export function saveBudgets(budgets: Budget[]): void {
  STATE.budgets = budgets;
  notify();
}

export function updateBudget(categoryId: string, monthlyLimit: number): void {
  const existing = STATE.budgets.find(b => b.categoryId === categoryId);
  if (existing) {
    existing.monthlyLimit = monthlyLimit;
  } else {
    STATE.budgets.push({ id: generateId(), userId: STATE.user?.id || "", categoryId, monthlyLimit });
  }
  actions.updateBudget(categoryId, monthlyLimit);
  notify();
}

export function addExpense(data: Omit<Expense, "id" | "userId" | "category">): Expense {
  const temp = { ...data, id: generateId(), userId: STATE.user?.id || "" } as Expense;
  STATE.expenses.unshift(temp);
  actions.addExpense(data).then(real => {
    const idx = STATE.expenses.findIndex(e => e.id === temp.id);
    if (idx !== -1) {
      STATE.expenses[idx] = { ...real, category: STATE.categories.find(c => c.id === real.categoryId) } as Expense;
      notify();
    }
  });
  notify();
  return temp;
}

export function updateExpense(id: string, data: Partial<Expense>): void {
  const idx = STATE.expenses.findIndex(e => e.id === id);
  if (idx !== -1) {
    STATE.expenses[idx] = { ...STATE.expenses[idx], ...data };
    // Need API route if we expand to update Expense later
    notify();
  }
}

export function deleteExpense(id: string): void {
  STATE.expenses = STATE.expenses.filter(e => e.id !== id);
  actions.deleteExpense(id);
  notify();
}

export function addGoal(data: Omit<Goal, "id" | "userId">): Goal {
  const g = { ...data, id: generateId(), userId: STATE.user?.id || "" } as Goal;
  STATE.goals.push(g);
  actions.addGoal(data).then(real => {
    const idx = STATE.goals.findIndex(x => x.id === g.id);
    if (idx !== -1) STATE.goals[idx] = real as Goal;
  });
  notify();
  return g;
}

export function updateGoal(id: string, data: Partial<Goal>): void {
  const idx = STATE.goals.findIndex(g => g.id === id);
  if (idx !== -1) {
    STATE.goals[idx] = { ...STATE.goals[idx], ...data };
    notify();
  }
}

export function deleteGoal(id: string): void {
  STATE.goals = STATE.goals.filter(g => g.id !== id);
  actions.deleteGoal(id);
  notify();
}

export function addNotification(title: string, body: string): void {
  STATE.notifications.unshift({ id: generateId(), userId: STATE.user?.id || "", title, body, readStatus: false, createdAt: new Date() });
  notify();
}

export function markNotificationRead(id: string): void {
  const idx = STATE.notifications.findIndex(n => n.id === id);
  if (idx !== -1) STATE.notifications[idx].readStatus = true;
  notify();
}

export function markAllNotificationsRead(): void {
  STATE.notifications.forEach(n => n.readStatus = true);
  notify();
}

export function saveSocialPosts(posts: RoastCard[]): void {
  STATE.posts = posts;
  notify();
}

export function addSocialPost(data: Omit<RoastCard, "id" | "userId" | "createdAt" | "reactions" | "reactionsJson" | "shareCount">): void {
  const temp = { ...data, id: generateId(), userId: STATE.user?.id || "", reactions: {}, reactionsJson: "{}", shareCount: 0, createdAt: new Date().toISOString() } as RoastCard;
  STATE.posts.unshift(temp);
  actions.addSocialPost(data).then(real => {
    const idx = STATE.posts.findIndex(p => p.id === temp.id);
    if (idx !== -1) STATE.posts[idx] = real as RoastCard;
    notify();
  });
  notify();
}

export function deleteSocialPost(id: string): void {
  STATE.posts = STATE.posts.filter(p => p.id !== id);
  notify();
}

export function toggleReaction(postId: string, emoji: string, userId: string): void {
  const post = STATE.posts.find(p => p.id === postId);
  if (!post) return;
  // Local optimisitc
  let reactions: Record<string, string[]> = {};
  try { reactions = JSON.parse(post.reactionsJson || "{}"); } catch (e) { }
  if (!reactions[emoji]) reactions[emoji] = [];
  const idx = reactions[emoji].indexOf(userId);
  if (idx >= 0) reactions[emoji].splice(idx, 1);
  else reactions[emoji].push(userId);
  if (reactions[emoji].length === 0) delete reactions[emoji];
  post.reactionsJson = JSON.stringify(reactions);

  actions.toggleReaction(postId, emoji);
  notify();
}

export function incrementShareCount(postId: string): void {
  const post = STATE.posts.find(p => p.id === postId);
  if (post) {
    post.shareCount++;
    actions.incrementShareCount(postId);
    notify();
  }
}

export function addSocialComment(comment: Omit<SocialComment, "id" | "createdAt" | "reactions" | "reactionsJson">): void {
  const temp = { ...comment, id: generateId(), userId: STATE.user?.id || "", reactions: {}, reactionsJson: "{}", createdAt: new Date().toISOString() } as SocialComment;
  STATE.comments.unshift(temp);
  actions.addSocialComment(comment).then(real => {
    const idx = STATE.comments.findIndex(c => c.id === temp.id);
    if (idx !== -1) STATE.comments[idx] = real as SocialComment;
  });
  notify();
}

export function deleteSocialComment(id: string): void {
  STATE.comments = STATE.comments.filter(c => c.id !== id);
  notify();
}

export function toggleCommentReaction(commentId: string, emoji: string, userId: string): void {
  const comment = STATE.comments.find(c => c.id === commentId);
  if (!comment) return;
  let reactions: Record<string, string[]> = {};
  if (comment.reactionsJson) try { reactions = JSON.parse(comment.reactionsJson); } catch (e) { }
  if (!reactions[emoji]) reactions[emoji] = [];
  const idx = reactions[emoji].indexOf(userId);
  if (idx >= 0) reactions[emoji].splice(idx, 1);
  else reactions[emoji].push(userId);
  if (reactions[emoji].length === 0) delete reactions[emoji];
  comment.reactionsJson = JSON.stringify(reactions);
  notify();
}

export function saveSocialProfile(profile: Partial<SocialProfile>): void {
  if (STATE.profile) {
    STATE.profile = { ...STATE.profile, ...profile } as SocialProfile;
  }
  actions.saveSocialProfile(profile);
  notify();
}

export function initSocialProfile(user: User): SocialProfile {
  if (STATE.profile) return STATE.profile;
  const p = {
    userId: user.id,
    displayName: user.name,
    bio: "",
    avatarGradient: Math.floor(Math.random() * 18),
    score: 0,
    streak: 0,
    badges: [],
    badgesJson: "[]",
    postCount: 0
  } as unknown as SocialProfile;
  STATE.profile = p;
  actions.saveSocialProfile(p);
  return p;
}

export function seedDemoData(): void { }
export async function seedSocialDemoData(): Promise<void> { }
