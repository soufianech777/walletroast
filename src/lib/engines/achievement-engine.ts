import { Expense, Category, Budget, Goal, User, RoastCard, SocialComment, Achievement, AchievementResult, AchievementTier, AchievementRarity } from "../types"

// --- Achievement Definitions ---
// We define the base metadata for all achievements.

type BadgeDef = Omit<Achievement, "id" | "unlockedAt" | "progress">

export const ACHIEVEMENT_DEFINITIONS: Record<string, BadgeDef> = {
  // Spending Control
  coffee_assassin: {
    name: "Coffee Assassin", tier: "bronze", rarity: "common", emoji: "☕💀", category: "Spending Control", isSecret: false,
    unlockMessage: "You survived 7 days without buying overpriced coffee. Wall Street fears you now.",
    roast: "Last month you spent enough on lattes to finance a small startup.", xpReward: 120, nextGoal: "Reach 14 days for Espresso Eliminator"
  },
  espresso_eliminator: {
    name: "Espresso Eliminator", tier: "silver", rarity: "uncommon", emoji: "⚡🛡️", category: "Spending Control", isSecret: false,
    unlockMessage: "14 days without coffee shops. Your caffeine withdrawal is powering the grid.",
    roast: "You used to tremble when the barista made eye contact.", xpReward: 300, nextGoal: "Reach 30 days for Caffeine God"
  },
  caffeine_god: {
    name: "Caffeine God", tier: "gold", rarity: "rare", emoji: "👑☕", category: "Spending Control", isSecret: false,
    unlockMessage: "30 days. You now brew coffee at home with the precision of a meth chemist.",
    roast: "Starbucks just filed for bankruptcy in your zip code.", xpReward: 800, nextGoal: null
  },
  subscription_slayer: {
    name: "Subscription Slayer", tier: "silver", rarity: "uncommon", emoji: "📺🗡️", category: "Spending Control", isSecret: false,
    unlockMessage: "You canceled a subscription. Netflix is crying.",
    roast: "You were paying $15/mo to watch 2 episodes of The Office a year.", xpReward: 200, nextGoal: "Keep subscriptions under $30/mo"
  },
  budget_samurai: {
    name: "Budget Samurai", tier: "gold", rarity: "rare", emoji: "⚔️📉", category: "Spending Control", isSecret: false,
    unlockMessage: "Perfect budget week. You sliced through temptation like a katana.",
    roast: "We're actually surprised. Usually you fold faster than a lawn chair at a yard sale.", xpReward: 500, nextGoal: "Do it for a whole month"
  },

  // Tracking Consistency
  data_nerd: {
    name: "Data Nerd", tier: "bronze", rarity: "common", emoji: "🤓📊", category: "Tracking Consistency", isSecret: false,
    unlockMessage: "Tracked expenses for 3 consecutive days.",
    roast: "Wow, you remembered to open the app. Have a cookie.", xpReward: 50, nextGoal: "Track for 7 days"
  },
  streak_machine: {
    name: "Streak Machine", tier: "silver", rarity: "uncommon", emoji: "🔥🤖", category: "Tracking Consistency", isSecret: false,
    unlockMessage: "7 day tracking streak! You're actually trying.",
    roast: "Don't let this go to your head. It's just tapping buttons.", xpReward: 250, nextGoal: "Track for 30 days"
  },
  obsessed: {
    name: "Obsessed", tier: "gold", rarity: "epic", emoji: "👀📱", category: "Tracking Consistency", isSecret: true,
    unlockMessage: "Logged 10 expenses in a single day.",
    roast: "Either you're extremely detailed, or you have a severe shopping addiction. Probably both.", xpReward: 600, nextGoal: null
  },

  // Savings & Goals
  baby_steps: {
    name: "Baby Steps", tier: "bronze", rarity: "common", emoji: "👶💰", category: "Savings & Goals", isSecret: false,
    unlockMessage: "Saved your first $100 towards a goal.",
    roast: "A whole $100? Don't buy a yacht just yet.", xpReward: 100, nextGoal: "Save $500"
  },
  goal_digger: {
    name: "Goal Digger", tier: "silver", rarity: "uncommon", emoji: "⛏️💎", category: "Savings & Goals", isSecret: false,
    unlockMessage: "Hit 50% of a savings goal.",
    roast: "Halfway there. Meaning you can still give up and blow it all on a weekend trip.", xpReward: 350, nextGoal: "Finish the goal"
  },
  stack_overflow: {
    name: "Stack Overflow", tier: "diamond", rarity: "legendary", emoji: "🏦🚀", category: "Savings & Goals", isSecret: false,
    unlockMessage: "Completed a major savings goal!",
    roast: "You actually did it. We're deleting our roast algorithms. (Just kidding, you're still broke).", xpReward: 1500, nextGoal: null
  },

  // Shame & Humor (Secret)
  speed_runner: {
    name: "Speed Runner", tier: "bronze", rarity: "epic", emoji: "🏃💸", category: "Shame", isSecret: true,
    unlockMessage: "Spent over 50% of your income in the first 7 days of the month.",
    roast: "Any% broke speedrun world record holder right here. Impressive.", xpReward: 50, nextGoal: "Survive the rest of the month"
  },
  late_night_impulse: {
    name: "Midnight Marauder", tier: "silver", rarity: "rare", emoji: "🦉🛒", category: "Shame", isSecret: true,
    unlockMessage: "Logged a 'Shopping' expense between 12 AM and 4 AM.",
    roast: "Nothing good happens after midnight, especially not on Amazon.", xpReward: 150, nextGoal: "Go to sleep"
  },
  wallet_life_support: {
    name: "Life Support", tier: "gold", rarity: "epic", emoji: "🏥💳", category: "Shame", isSecret: true,
    unlockMessage: "Over budget in more than 3 categories at once.",
    roast: "Your bank account is currently in the ICU. Please send thoughts and prayers.", xpReward: 100, nextGoal: "Stop spending money immediately"
  },
  fast_food_royalty: {
    name: "Fast Food Royalty", tier: "silver", rarity: "uncommon", emoji: "🍔👑", category: "Shame", isSecret: true,
    unlockMessage: "Logged 5 food & dining expenses in a single week.",
    roast: "Your blood type is officially changing to high fructose corn syrup.", xpReward: 120, nextGoal: "Eat a vegetable"
  },

  // Comeback
  phoenix_mode: {
    name: "Phoenix Mode", tier: "gold", rarity: "epic", emoji: "🦅🔥", category: "Comeback", isSecret: false,
    unlockMessage: "Went from <50 Discipline Score to >80 in one week.",
    roast: "Rising from the ashes of your terrible financial decisions. Majestic.", xpReward: 800, nextGoal: "Maintain >80 for a month"
  },

  // Social
  first_blood: {
    name: "First Blood", tier: "bronze", rarity: "common", emoji: "🩸📸", category: "Social", isSecret: false,
    unlockMessage: "Posted your first Roast Card to the social feed.",
    roast: "Welcome to the thunderdome. Prepare to be judged.", xpReward: 100, nextGoal: "Get 5 reactions"
  },
  viral_moment: {
    name: "Viral Moment", tier: "gold", rarity: "rare", emoji: "🦠📈", category: "Social", isSecret: false,
    unlockMessage: "Got 10+ reactions on a single Roast Card.",
    roast: "Everyone is laughing AT you, not with you. But hey, clout is clout.", xpReward: 500, nextGoal: null
  }
}

// XP Thresholds for Levels
function getLevelFromXp(xp: number): { level: number, progress: number } {
  // Level 1 = 0
  // Level 2 = 500
  // Level 3 = 1200
  // Level 4 = 2500
  // Level 5 = 4500
  // Level 6 = 7000
  // Formula: approx xp = (level-1)^2 * 300
  if (xp < 0) return { level: 1, progress: 0 }
  
  let level = 1;
  let xpForNext = 500;
  let currentTierBase = 0;

  while (xp >= xpForNext) {
    level++;
    currentTierBase = xpForNext;
    xpForNext = currentTierBase + (level * 400); // 500, 1300, 2500, 4100...
  }

  const xpIntoLevel = xp - currentTierBase;
  const xpRequiredForLevel = xpForNext - currentTierBase;
  const progress = Math.floor((xpIntoLevel / xpRequiredForLevel) * 100);

  return { level, progress };
}


// Engine computation
export function computeAchievements(
  expenses: Expense[],
  categories: Category[],
  budgets: Budget[],
  goals: Goal[],
  user: User,
  posts: RoastCard[],
  comments: SocialComment[]
): AchievementResult {
  const unlockedIds = new Set<string>();
  const progressMap = new Map<string, number>();
  let totalXp = 0;

  const now = new Date();
  const sortedExpenses = [...expenses].sort((a, b) => new Date(a.expenseDate).getTime() - new Date(b.expenseDate).getTime());
  
  // Helpers
  const getCategoryByName = (name: string) => categories.find(c => c.name.toLowerCase().includes(name.toLowerCase()));
  
  const coffeeCat = getCategoryByName("coffee");
  const foodCat = getCategoryByName("food");
  const shoppingCat = getCategoryByName("shopping");

  // --- COMPUTE LOGIC ---

  // 1. Coffee Assassin (7 days no coffee)
  if (coffeeCat) {
    const coffeeExpenses = sortedExpenses.filter(e => e.categoryId === coffeeCat.id);
    if (coffeeExpenses.length > 0) {
      const lastCoffeeDate = new Date(coffeeExpenses[coffeeExpenses.length - 1].expenseDate);
      const daysSinceCoffee = Math.floor((now.getTime() - lastCoffeeDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceCoffee >= 7) unlockedIds.add("coffee_assassin");
      else progressMap.set("coffee_assassin", Math.min(99, Math.floor((daysSinceCoffee / 7) * 100)));

      if (daysSinceCoffee >= 14) unlockedIds.add("espresso_eliminator");
      else progressMap.set("espresso_eliminator", Math.min(99, Math.floor((daysSinceCoffee / 14) * 100)));

      if (daysSinceCoffee >= 30) unlockedIds.add("caffeine_god");
      else progressMap.set("caffeine_god", Math.min(99, Math.floor((daysSinceCoffee / 30) * 100)));
    } else if (expenses.length > 10) {
      // If they have lots of expenses but no coffee, they might just not drink coffee.
      unlockedIds.add("coffee_assassin");
      unlockedIds.add("espresso_eliminator");
    }
  }

  // 2. Data Nerd & Streak Machine (Consecutive tracking days)
  const daysWithExpenses = new Set(expenses.map(e => new Date(e.expenseDate).toDateString()));
  if (daysWithExpenses.size >= 3) unlockedIds.add("data_nerd");
  else progressMap.set("data_nerd", Math.floor((daysWithExpenses.size / 3) * 100));

  if (daysWithExpenses.size >= 7) unlockedIds.add("streak_machine");
  else progressMap.set("streak_machine", Math.floor((daysWithExpenses.size / 7) * 100));

  // 3. Obsessed (10 expenses in a day)
  const expensesPerDay: Record<string, number> = {};
  expenses.forEach(e => {
    const d = new Date(e.expenseDate).toDateString();
    expensesPerDay[d] = (expensesPerDay[d] || 0) + 1;
    if (expensesPerDay[d] >= 10) unlockedIds.add("obsessed");
  });

  // 4. Baby Steps, Goal Digger, Stack Overflow (Goals)
  if (goals.length > 0) {
    let bestGoalProgress = 0;
    goals.forEach(g => {
      const p = g.targetAmount > 0 ? (g.savedAmount / g.targetAmount) * 100 : 0;
      if (p > bestGoalProgress) bestGoalProgress = p;
      if (g.savedAmount >= 100) unlockedIds.add("baby_steps");
      if (p >= 50) unlockedIds.add("goal_digger");
      if (p >= 100) unlockedIds.add("stack_overflow");
    });
    
    if (!unlockedIds.has("baby_steps")) {
      const maxSaved = Math.max(...goals.map(g => g.savedAmount), 0);
      progressMap.set("baby_steps", Math.floor((maxSaved / 100) * 100));
    }
    if (!unlockedIds.has("goal_digger")) {
      progressMap.set("goal_digger", Math.min(99, Math.floor(bestGoalProgress * 2)));
    }
  }

  // 5. Speed Runner (Spent >50% income in first 7 days of month)
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const first7DaysExpenses = expenses.filter(e => {
    const d = new Date(e.expenseDate);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear && d.getDate() <= 7;
  });
  const spentInFirst7Days = first7DaysExpenses.reduce((s, e) => s + e.amount, 0);
  if (user.monthlyIncome > 0 && spentInFirst7Days > (user.monthlyIncome * 0.5)) {
    unlockedIds.add("speed_runner");
  }

  // 6. Late Night Impulse
  if (shoppingCat) {
    const lateShopping = expenses.some(e => {
      if (e.categoryId !== shoppingCat.id) return false;
      const hour = new Date(e.expenseDate).getHours();
      return hour >= 0 && hour <= 4;
    });
    if (lateShopping) unlockedIds.add("late_night_impulse");
  }

  // 7. Wallet Life Support (Over budget in 3+ categories)
  const currentMonthExpenses = expenses.filter(e => {
    const d = new Date(e.expenseDate);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  
  let overBudgetCount = 0;
  budgets.forEach(b => {
    const spent = currentMonthExpenses.filter(e => e.categoryId === b.categoryId).reduce((s, e) => s + e.amount, 0);
    if (b.monthlyLimit > 0 && spent > b.monthlyLimit) overBudgetCount++;
  });
  if (overBudgetCount >= 3) unlockedIds.add("wallet_life_support");
  progressMap.set("wallet_life_support", Math.floor((overBudgetCount / 3) * 100));

  // 8. Fast Food Royalty
  if (foodCat) {
    // Check rolling 7 days for 5 food expenses
    let maxFoodInWeek = 0;
    for (let i = 0; i < sortedExpenses.length; i++) {
      if (sortedExpenses[i].categoryId !== foodCat.id) continue;
      const startDate = new Date(sortedExpenses[i].expenseDate).getTime();
      let count = 1;
      for (let j = i + 1; j < sortedExpenses.length; j++) {
        if (sortedExpenses[j].categoryId !== foodCat.id) continue;
        const checkDate = new Date(sortedExpenses[j].expenseDate).getTime();
        if (checkDate - startDate <= 7 * 24 * 60 * 60 * 1000) count++;
        else break;
      }
      if (count > maxFoodInWeek) maxFoodInWeek = count;
    }
    if (maxFoodInWeek >= 5) unlockedIds.add("fast_food_royalty");
    progressMap.set("fast_food_royalty", Math.floor((maxFoodInWeek / 5) * 100));
  }

  // 9. Social Badges
  if (posts.length > 0) unlockedIds.add("first_blood");
  else progressMap.set("first_blood", 0);

  let maxReactions = 0;
  posts.forEach(p => {
    let reactionCount = 0;
    try {
      const parsed = JSON.parse(p.reactionsJson || "{}");
      const reactions = parsed as Record<string, string[]>;
      Object.values(reactions).forEach((arr) => {
        reactionCount += arr.length;
      });
    } catch(e) {}
    if (reactionCount > maxReactions) maxReactions = reactionCount;
  });

  if (maxReactions >= 10) unlockedIds.add("viral_moment");
  progressMap.set("viral_moment", Math.floor((maxReactions / 10) * 100));


  // Build Final Output
  const unlocked: Achievement[] = [];
  const locked: Achievement[] = [];

  Object.entries(ACHIEVEMENT_DEFINITIONS).forEach(([id, def]) => {
    const isUnlocked = unlockedIds.has(id);
    const progress = isUnlocked ? 100 : (progressMap.get(id) || 0);
    
    // Simple mock timestamp for unlocks (since we don't store them in DB, we just say "Today" essentially, 
    // or we just leave it as a string). Ideally, we'd store unlocks in localStorage.
    const unlockedAt = isUnlocked ? new Date().toISOString() : null;

    const achievement: Achievement = {
      id,
      ...def,
      unlockedAt,
      progress: Math.min(100, Math.max(0, progress))
    };

    if (isUnlocked) {
      unlocked.push(achievement);
      totalXp += def.xpReward;
    } else {
      locked.push(achievement);
    }
  });

  const { level, progress: levelProgress } = getLevelFromXp(totalXp);

  return {
    unlocked,
    locked,
    totalXp,
    level,
    levelProgress,
    totalUnlocked: unlocked.length
  };
}
