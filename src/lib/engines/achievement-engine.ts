import { Expense, Category, Budget, Goal, User, RoastCard, SocialComment, Achievement, AchievementResult } from "../types"

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
  },

  // 🍌 Banana Zone — Creative banana-themed achievements
  banana_split: {
    name: "Banana Split", tier: "bronze", rarity: "common", emoji: "🍌💔", category: "Banana Zone", isSecret: false,
    unlockMessage: "Your spending is split across 5+ categories this month.",
    roast: "Your money goes everywhere except savings. It's like a banana split — messy and regrettable.", xpReward: 80, nextGoal: "Focus on fewer categories"
  },
  banana_republic: {
    name: "Banana Republic", tier: "gold", rarity: "epic", emoji: "🍌🏛️👑", category: "Banana Zone", isSecret: false,
    unlockMessage: "Ruled your budget with an iron fist — under budget in ALL categories for a full month!",
    roast: "You've established a financial dictatorship. Your wallet worships you.", xpReward: 1000, nextGoal: null
  },
  banana_peel: {
    name: "Banana Peel", tier: "silver", rarity: "uncommon", emoji: "🍌😵💫", category: "Banana Zone", isSecret: true,
    unlockMessage: "Slipped up! Went over budget right after a perfect week.",
    roast: "You were doing so well... then you stepped on the financial banana peel. Classic.", xpReward: 150, nextGoal: "Get back on track"
  },
  go_bananas: {
    name: "Go Bananas", tier: "silver", rarity: "rare", emoji: "🍌🤪🎉", category: "Banana Zone", isSecret: true,
    unlockMessage: "Spent over 200% of your entertainment budget. You went absolutely bananas.",
    roast: "Entertainment budget? More like entertainment SUGGESTION. You obliterated it.", xpReward: 100, nextGoal: "Maybe watch free YouTube?"
  },
  banana_bread: {
    name: "Banana Bread", tier: "gold", rarity: "rare", emoji: "🍌🍞💰", category: "Banana Zone", isSecret: false,
    unlockMessage: "Turned rotten finances into something beautiful — saved $1000+ total!",
    roast: "Like turning old bananas into bread, you turned your trash spending into actual savings. Chef's kiss.", xpReward: 750, nextGoal: "Save $2500"
  },
  top_banana: {
    name: "Top Banana", tier: "diamond", rarity: "legendary", emoji: "🍌👑⭐", category: "Banana Zone", isSecret: false,
    unlockMessage: "Reached Level 10! You are the TOP BANANA of financial discipline.",
    roast: "You've ascended. Most people can't even spell 'budget'. You ARE the budget.", xpReward: 2000, nextGoal: null
  },
  banana_hammock: {
    name: "Banana Hammock", tier: "bronze", rarity: "uncommon", emoji: "🍌🏖️😎", category: "Banana Zone", isSecret: true,
    unlockMessage: "No expenses logged on a weekend. You're just... chilling.",
    roast: "Zero spending on a weekend? Either you're enlightened or you didn't leave the couch.", xpReward: 120, nextGoal: "Do it again next weekend"
  },

  // Milestones
  centurion: {
    name: "Centurion", tier: "silver", rarity: "uncommon", emoji: "💯⚡🏅", category: "Milestones", isSecret: false,
    unlockMessage: "Logged your 100th expense! You're a tracking warrior.",
    roast: "100 expenses tracked. That's 100 times you chose to face the pain. Respect.", xpReward: 400, nextGoal: "Log 250 expenses"
  },
  quarter_thousand: {
    name: "Quarter Thousand", tier: "gold", rarity: "rare", emoji: "🎯2️⃣5️⃣0️⃣", category: "Milestones", isSecret: false,
    unlockMessage: "250 expenses logged. You're basically a human spreadsheet.",
    roast: "At this point, Excel is jealous of your tracking abilities.", xpReward: 800, nextGoal: "Log 500 expenses"
  },
  big_spender: {
    name: "Big Spender", tier: "silver", rarity: "rare", emoji: "🐋💸🔥", category: "Milestones", isSecret: true,
    unlockMessage: "Logged a single expense over $500. Whale alert!",
    roast: "Was it a TV? A designer bag? A questionable NFT? Whatever it was, your wallet felt that.", xpReward: 200, nextGoal: null
  },
  ant_colony: {
    name: "Ant Colony", tier: "bronze", rarity: "uncommon", emoji: "🐜🐜🐜", category: "Milestones", isSecret: false,
    unlockMessage: "Logged 10+ micro-expenses (under $5) in a month.",
    roast: "Death by a thousand paper cuts. Each tiny purchase whispers 'I'm just $3' but together they scream.", xpReward: 100, nextGoal: "Reduce micro-expenses"
  },

  // Expanded Spending Control
  impulse_detox: {
    name: "Impulse Detox", tier: "gold", rarity: "rare", emoji: "🧘‍♂️💸🧹", category: "Spending Control", isSecret: false,
    unlockMessage: "No shopping expenses for 14 days straight. Your willpower is terrifying.",
    roast: "Amazon's algorithm is sending you 'we miss you' emails. Stay strong.", xpReward: 600, nextGoal: "Make it 30 days"
  },
  penny_pincher: {
    name: "Penny Pincher", tier: "bronze", rarity: "common", emoji: "🪙🦀✨", category: "Spending Control", isSecret: false,
    unlockMessage: "Spent under 30% of income this month. You crab-walk past every sale.",
    roast: "You hold onto money tighter than a crab holds onto... well, everything.", xpReward: 150, nextGoal: "Do it for 3 months"
  },
  subscription_genocide: {
    name: "Subscription Genocide", tier: "gold", rarity: "epic", emoji: "📺💀🔥", category: "Spending Control", isSecret: false,
    unlockMessage: "Canceled or reduced subscriptions to under $15/month total.",
    roast: "You just committed a streaming service massacre. Netflix, Spotify, Disney+ — all gone. The silence is deafening.", xpReward: 700, nextGoal: null
  },

  // Expanded Shame & Humor
  uber_eats_ceo: {
    name: "Uber Eats CEO", tier: "gold", rarity: "epic", emoji: "🚗🍕👔", category: "Shame", isSecret: true,
    unlockMessage: "15+ food expenses this month. You're personally funding the gig economy.",
    roast: "At this point, the delivery driver knows your order, your dog's name, and your WiFi password.", xpReward: 100, nextGoal: "Learn to boil water"
  },
  ghost_wallet: {
    name: "Ghost Wallet", tier: "diamond", rarity: "legendary", emoji: "👻💳🕳️", category: "Shame", isSecret: true,
    unlockMessage: "Spent 100% of monthly income. Your wallet has left the chat.",
    roast: "Your bank account is now a ghost town. Tumbleweeds. Echoes. Nothing.", xpReward: 50, nextGoal: "Please stop spending"
  },
  emotional_spender: {
    name: "Emotional Spender", tier: "silver", rarity: "rare", emoji: "😭🛒💳", category: "Shame", isSecret: true,
    unlockMessage: "3+ shopping expenses in a single day. Retail therapy activated.",
    roast: "Your credit card needs therapy after what you put it through today.", xpReward: 120, nextGoal: "Try journaling instead"
  },
  black_hole_budget: {
    name: "Black Hole Budget", tier: "gold", rarity: "epic", emoji: "🕳️💰🌀", category: "Shame", isSecret: true,
    unlockMessage: "Over budget in 5+ categories simultaneously.",
    roast: "Your budget has collapsed into a financial singularity. Not even light can escape your spending.", xpReward: 80, nextGoal: "Close the portal"
  },

  // Expanded Comeback
  diet_wallet: {
    name: "Diet Wallet", tier: "silver", rarity: "uncommon", emoji: "🥗💰📉", category: "Comeback", isSecret: false,
    unlockMessage: "Reduced total spending by 20% compared to last month.",
    roast: "Your wallet is on a diet and it's actually working. Unlike your real diet.", xpReward: 400, nextGoal: "Reduce by 30%"
  },
  redemption_arc: {
    name: "Redemption Arc", tier: "gold", rarity: "epic", emoji: "🌅🦋✨", category: "Comeback", isSecret: false,
    unlockMessage: "Went from over-budget in 3+ categories to under-budget in ALL categories.",
    roast: "This is your anime redemption arc. The villain became the hero. Beautiful.", xpReward: 900, nextGoal: null
  },

  // Expanded Social
  roast_master: {
    name: "Roast Master", tier: "silver", rarity: "uncommon", emoji: "🔥👨‍🍳🎤", category: "Social", isSecret: false,
    unlockMessage: "Posted 5+ Roast Cards. You're a professional self-roaster now.",
    roast: "You voluntarily expose your finances to strangers for fun. Seek help.", xpReward: 300, nextGoal: "Post 10 roast cards"
  },
  clout_chaser: {
    name: "Clout Chaser", tier: "gold", rarity: "rare", emoji: "🏃‍♂️✨📱", category: "Social", isSecret: false,
    unlockMessage: "Got reactions on 5+ different posts. The people love your pain.",
    roast: "Your financial suffering is entertainment for the masses. Congratulations?", xpReward: 450, nextGoal: null
  },

  // Expanded Tracking
  spreadsheet_soul: {
    name: "Spreadsheet Soul", tier: "gold", rarity: "epic", emoji: "📋👻🔢", category: "Tracking Consistency", isSecret: false,
    unlockMessage: "Tracked expenses every single day for 30 days straight.",
    roast: "Your soul has merged with Google Sheets. You dream in cells and formulas.", xpReward: 1000, nextGoal: "Track for 60 days"
  },
  receipt_dragon: {
    name: "Receipt Dragon", tier: "silver", rarity: "uncommon", emoji: "🧾🐉🔥", category: "Tracking Consistency", isSecret: false,
    unlockMessage: "Logged 50+ expenses total. You hoard receipts like a dragon hoards gold.",
    roast: "You guard your expense data with the ferocity of Smaug. Nobody touches your spreadsheets.", xpReward: 300, nextGoal: "Log 100 expenses"
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
  _comments: SocialComment[]
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
    } catch {}
    if (reactionCount > maxReactions) maxReactions = reactionCount;
  });

  if (maxReactions >= 10) unlockedIds.add("viral_moment");
  progressMap.set("viral_moment", Math.floor((maxReactions / 10) * 100));

  // 10. Roast Master (5+ posts)
  if (posts.length >= 5) unlockedIds.add("roast_master");
  else progressMap.set("roast_master", Math.floor((posts.length / 5) * 100));

  // 11. Clout Chaser (reactions on 5+ different posts)
  let postsWithReactions = 0;
  posts.forEach(p => {
    let rc = 0;
    try {
      const pr = JSON.parse(p.reactionsJson || "{}") as Record<string, string[]>;
      Object.values(pr).forEach(arr => { rc += arr.length; });
    } catch {}
    if (rc > 0) postsWithReactions++;
  });
  if (postsWithReactions >= 5) unlockedIds.add("clout_chaser");
  else progressMap.set("clout_chaser", Math.floor((postsWithReactions / 5) * 100));

  // --- 🍌 BANANA ZONE ---

  // 12. Banana Split (spending across 5+ categories this month)
  const categoriesUsedThisMonth = new Set(currentMonthExpenses.map(e => e.categoryId));
  if (categoriesUsedThisMonth.size >= 5) unlockedIds.add("banana_split");
  else progressMap.set("banana_split", Math.floor((categoriesUsedThisMonth.size / 5) * 100));

  // 13. Banana Republic (under budget in ALL categories for the month)
  if (budgets.length > 0) {
    let allUnderBudget = true;
    budgets.forEach(b => {
      const spent = currentMonthExpenses.filter(e => e.categoryId === b.categoryId).reduce((s, e) => s + e.amount, 0);
      if (b.monthlyLimit > 0 && spent > b.monthlyLimit) allUnderBudget = false;
    });
    if (allUnderBudget && currentMonthExpenses.length > 0) unlockedIds.add("banana_republic");
  }

  // 14. Banana Peel (over budget after a good streak — simplified: over budget in any cat while having budget_samurai)
  if (unlockedIds.has("budget_samurai") && overBudgetCount > 0) unlockedIds.add("banana_peel");

  // 15. Go Bananas (200%+ of entertainment budget)
  const entertainmentCat = getCategoryByName("entertainment");
  if (entertainmentCat) {
    const entertainBudget = budgets.find(b => b.categoryId === entertainmentCat.id);
    if (entertainBudget && entertainBudget.monthlyLimit > 0) {
      const entertainSpent = currentMonthExpenses.filter(e => e.categoryId === entertainmentCat.id).reduce((s, e) => s + e.amount, 0);
      const entertainPct = (entertainSpent / entertainBudget.monthlyLimit) * 100;
      if (entertainPct >= 200) unlockedIds.add("go_bananas");
      else progressMap.set("go_bananas", Math.floor((entertainPct / 200) * 100));
    }
  }

  // 16. Banana Bread (saved $1000+ total across all goals)
  const totalSaved = goals.reduce((s, g) => s + g.savedAmount, 0);
  if (totalSaved >= 1000) unlockedIds.add("banana_bread");
  else if (goals.length > 0) progressMap.set("banana_bread", Math.floor((totalSaved / 1000) * 100));

  // 17. Banana Hammock (no expenses on a weekend)
  const weekendDays = [...Array(14)].map((_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    return d;
  }).filter(d => d.getDay() === 0 || d.getDay() === 6);
  const hasWeekendWithNoExpenses = weekendDays.some(wd => {
    const dayStr = wd.toDateString();
    return !expenses.some(e => new Date(e.expenseDate).toDateString() === dayStr);
  });
  if (hasWeekendWithNoExpenses && expenses.length > 5) unlockedIds.add("banana_hammock");

  // --- MILESTONES ---

  // 18. Centurion (100 expenses)
  if (expenses.length >= 100) unlockedIds.add("centurion");
  else progressMap.set("centurion", Math.floor((expenses.length / 100) * 100));

  // 19. Quarter Thousand (250 expenses)
  if (expenses.length >= 250) unlockedIds.add("quarter_thousand");
  else progressMap.set("quarter_thousand", Math.floor((expenses.length / 250) * 100));

  // 20. Big Spender (single expense over $500)
  if (expenses.some(e => e.amount >= 500)) unlockedIds.add("big_spender");

  // 21. Ant Colony (10+ expenses under $5 in a month)
  const microExpenses = currentMonthExpenses.filter(e => e.amount < 5).length;
  if (microExpenses >= 10) unlockedIds.add("ant_colony");
  else progressMap.set("ant_colony", Math.floor((microExpenses / 10) * 100));

  // --- EXPANDED SPENDING CONTROL ---

  // 22. Impulse Detox (no shopping for 14 days)
  if (shoppingCat) {
    const shopExpenses = sortedExpenses.filter(e => e.categoryId === shoppingCat.id);
    if (shopExpenses.length > 0) {
      const lastShopDate = new Date(shopExpenses[shopExpenses.length - 1].expenseDate);
      const daysSinceShop = Math.floor((now.getTime() - lastShopDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceShop >= 14) unlockedIds.add("impulse_detox");
      else progressMap.set("impulse_detox", Math.floor((daysSinceShop / 14) * 100));
    }
  }

  // 23. Penny Pincher (spent under 30% of income this month)
  const totalSpentThisMonth = currentMonthExpenses.reduce((s, e) => s + e.amount, 0);
  if (user.monthlyIncome > 0 && totalSpentThisMonth < (user.monthlyIncome * 0.3) && currentMonthExpenses.length > 0) {
    unlockedIds.add("penny_pincher");
  } else if (user.monthlyIncome > 0) {
    progressMap.set("penny_pincher", Math.max(0, Math.floor((1 - totalSpentThisMonth / (user.monthlyIncome * 0.3)) * 100)));
  }

  // 24. Subscription Genocide (subscriptions under $15/mo)
  const subsCat = getCategoryByName("subscription");
  if (subsCat) {
    const subsSpent = currentMonthExpenses.filter(e => e.categoryId === subsCat.id).reduce((s, e) => s + e.amount, 0);
    if (subsSpent <= 15 && subsSpent > 0) unlockedIds.add("subscription_genocide");
    else if (subsSpent > 15) progressMap.set("subscription_genocide", Math.floor((15 / subsSpent) * 100));
  }

  // --- EXPANDED SHAME ---

  // 25. Uber Eats CEO (15+ food expenses this month)
  if (foodCat) {
    const foodCountMonth = currentMonthExpenses.filter(e => e.categoryId === foodCat.id).length;
    if (foodCountMonth >= 15) unlockedIds.add("uber_eats_ceo");
    else progressMap.set("uber_eats_ceo", Math.floor((foodCountMonth / 15) * 100));
  }

  // 26. Ghost Wallet (spent 100% of income)
  if (user.monthlyIncome > 0 && totalSpentThisMonth >= user.monthlyIncome) {
    unlockedIds.add("ghost_wallet");
  } else if (user.monthlyIncome > 0) {
    progressMap.set("ghost_wallet", Math.floor((totalSpentThisMonth / user.monthlyIncome) * 100));
  }

  // 27. Emotional Spender (3+ shopping expenses in a day)
  if (shoppingCat) {
    const shopPerDay: Record<string, number> = {};
    expenses.forEach(e => {
      if (e.categoryId !== shoppingCat.id) return;
      const d = new Date(e.expenseDate).toDateString();
      shopPerDay[d] = (shopPerDay[d] || 0) + 1;
      if (shopPerDay[d] >= 3) unlockedIds.add("emotional_spender");
    });
  }

  // 28. Black Hole Budget (over budget in 5+ categories)
  if (overBudgetCount >= 5) unlockedIds.add("black_hole_budget");
  progressMap.set("black_hole_budget", Math.floor((overBudgetCount / 5) * 100));

  // --- EXPANDED COMEBACK ---

  // 29. Diet Wallet (simplified: spent less than 80% of income this month when income > 0)
  if (user.monthlyIncome > 0 && totalSpentThisMonth > 0 && totalSpentThisMonth < (user.monthlyIncome * 0.8)) {
    unlockedIds.add("diet_wallet");
  }

  // 30. Redemption Arc (was over budget in 3+, now under in all)
  if (budgets.length >= 3 && overBudgetCount === 0 && currentMonthExpenses.length > 0) {
    unlockedIds.add("redemption_arc");
  }

  // --- EXPANDED TRACKING ---

  // 31. Spreadsheet Soul (30 consecutive tracking days)
  if (daysWithExpenses.size >= 30) unlockedIds.add("spreadsheet_soul");
  else progressMap.set("spreadsheet_soul", Math.floor((daysWithExpenses.size / 30) * 100));

  // 32. Receipt Dragon (50+ expenses total)
  if (expenses.length >= 50) unlockedIds.add("receipt_dragon");
  else progressMap.set("receipt_dragon", Math.floor((expenses.length / 50) * 100));

  // 33. Top Banana (computed after XP — deferred to final output)
  // We'll check this after totalXp is calculated below.


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

  // 33. Top Banana — check after level is computed
  if (level >= 10) {
    const topBananaDef = ACHIEVEMENT_DEFINITIONS["top_banana"];
    const existingIdx = locked.findIndex(a => a.id === "top_banana");
    if (existingIdx !== -1) {
      locked.splice(existingIdx, 1);
      totalXp += topBananaDef.xpReward;
      unlocked.push({
        id: "top_banana", ...topBananaDef,
        unlockedAt: new Date().toISOString(), progress: 100
      });
    }
  } else {
    const topIdx = locked.findIndex(a => a.id === "top_banana");
    if (topIdx !== -1) {
      locked[topIdx].progress = Math.floor((level / 10) * 100);
    }
  }

  return {
    unlocked,
    locked,
    totalXp,
    level,
    levelProgress,
    totalUnlocked: unlocked.length
  };
}
