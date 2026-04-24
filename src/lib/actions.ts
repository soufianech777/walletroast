"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "./prisma";
import { User, Category, Budget, Expense, Goal, Notification, RoastCard, SocialComment, SocialProfile } from "./types";
import { generateId } from "./utils";
import { DEFAULT_CATEGORIES } from "./types";

export async function getUser(): Promise<User | null> {
    const { userId } = await auth();
    if (!userId) return null;

    const user = await prisma.user.findUnique({
        where: { clerkId: userId }
    });

    if (!user) {
        // Attempt to create a standard user based on Clerk data if available? 
        // Usually handled by a webhook or an explicit onboarding step.
        return null;
    }

    return user as unknown as (User | null);
}

export async function createDefaultUser(data: {
    name: string
    email: string
    currency: string
    monthlyIncome: number
    roastLevel: string
    savingsGoal: number
}) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const existingUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (existingUser) return existingUser as unknown as User;

    const newUser = await prisma.user.create({
        data: {
            clerkId: userId,
            name: data.name,
            email: data.email,
            currency: data.currency,
            monthlyIncome: data.monthlyIncome,
            roastLevel: data.roastLevel,
            savingsGoal: data.savingsGoal,
            subscriptionPlan: "free",
            onboardingComplete: true,
            categories: {
                create: DEFAULT_CATEGORIES.map((c: { name: string, icon: string, color: string, isDefault: boolean }) => ({
                    name: c.name,
                    icon: c.icon,
                    color: c.color,
                    isDefault: c.isDefault
                }))
            }
        },
        include: { categories: true }
    });

    // Create default budgets
    if (newUser.categories && newUser.categories.length > 0) {
        await prisma.budget.createMany({
            data: newUser.categories.map((c: Category) => ({
                userId: newUser.id,
                categoryId: c.id,
                monthlyLimit: Math.round(data.monthlyIncome * 0.1)
            }))
        });
    }

    return newUser as unknown as User;
}

export async function saveUserAction(data: Partial<User>) {
    const { userId } = await auth();
    if (!userId) return null;

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) return null;

    return prisma.user.update({
        where: { id: user.id },
        data: {
            name: data.name,
            bio: data.bio,
            currency: data.currency,
            monthlyIncome: data.monthlyIncome,
            savingsGoal: data.savingsGoal,
            roastLevel: data.roastLevel,
            employmentStatus: data.employmentStatus,
            industry: data.industry,
            housingStatus: data.housingStatus,
            financialGoal: data.financialGoal,
            monthlyExpenses: data.monthlyExpenses,
            dependents: data.dependents,
            hasEmergencyFund: data.hasEmergencyFund,
            paymentMethod: data.paymentMethod,
        }
    });
}

export async function getCategories() {
    const user = await getUser();
    if (!user) return [];
    return prisma.category.findMany({ where: { userId: user.id } });
}

export async function getBudgets() {
    const user = await getUser();
    if (!user) return [];
    return prisma.budget.findMany({
        where: { userId: user.id },
        include: { category: true }
    });
}

export async function updateBudget(categoryId: string, monthlyLimit: number) {
    const user = await getUser();
    if (!user) return null;

    const existing = await prisma.budget.findFirst({
        where: { userId: user.id, categoryId }
    });

    if (existing) {
        return prisma.budget.update({
            where: { id: existing.id },
            data: { monthlyLimit }
        });
    } else {
        return prisma.budget.create({
            data: { userId: user.id, categoryId, monthlyLimit }
        });
    }
}

export async function getExpenses() {
    const user = await getUser();
    if (!user) return [];
    return prisma.expense.findMany({
        where: { userId: user.id },
        include: { category: true },
        orderBy: { expenseDate: 'desc' }
    });
}

export async function addExpense(data: Omit<Expense, "id" | "userId" | "category">) {
    const user = await getUser();
    if (!user) throw new Error("Unauthorized");
    return prisma.expense.create({
        data: {
            userId: user.id,
            categoryId: data.categoryId,
            amount: data.amount,
            note: data.note,
            expenseDate: new Date(data.expenseDate),
            isRecurring: data.isRecurring,
            recurringType: data.recurringType
        }
    });
}

export async function deleteExpense(id: string) {
    const user = await getUser();
    if (!user) return;
    await prisma.expense.delete({ where: { id, userId: user.id } });
}

export async function getGoals() {
    const user = await getUser();
    if (!user) return [];
    return prisma.goal.findMany({ where: { userId: user.id } });
}

export async function addGoal(data: Omit<Goal, "id" | "userId">) {
    const user = await getUser();
    if (!user) throw new Error("Unauthorized");
    return prisma.goal.create({
        data: {
            userId: user.id,
            title: data.title,
            targetAmount: data.targetAmount,
            savedAmount: data.savedAmount,
            deadline: new Date(data.deadline)
        }
    });
}

export async function deleteGoal(id: string) {
    const user = await getUser();
    if (!user) return;
    await prisma.goal.delete({ where: { id, userId: user.id } });
}

export async function getSocialPosts() {
    return prisma.roastCard.findMany({
        orderBy: { createdAt: 'desc' },
        include: { user: true }
    });
}

export async function addSocialPost(data: Omit<RoastCard, "id" | "userId" | "createdAt" | "reactions" | "reactionsJson" | "shareCount">) {
    const user = await getUser();
    if (!user) throw new Error("Unauthorized");
    return prisma.roastCard.create({
        data: {
            userId: user.id,
            username: data.username,
            avatarGradient: data.avatarGradient,
            disciplineScore: data.disciplineScore,
            biggestWasteCategory: data.biggestWasteCategory,
            biggestWasteIcon: data.biggestWasteIcon,
            wastedAmount: data.wastedAmount,
            roastMessage: data.roastMessage,
            roastLevel: data.roastLevel,
            streak: data.streak,
            isAnonymous: data.isAnonymous,
            isPublic: data.isPublic,
            commentsDisabled: data.commentsDisabled,
        }
    });
}

export async function toggleReaction(postId: string, emoji: string) {
    const user = await getUser();
    if (!user) return;
    const post = await prisma.roastCard.findUnique({ where: { id: postId } });
    if (!post) return;

    let reactions: Record<string, string[]> = {};
    if (post.reactionsJson) {
        try { reactions = JSON.parse(post.reactionsJson); } catch (e) { }
    }

    if (!reactions[emoji]) reactions[emoji] = [];

    const idx = reactions[emoji].indexOf(user.id);
    if (idx >= 0) {
        reactions[emoji].splice(idx, 1);
        if (reactions[emoji].length === 0) delete reactions[emoji];
    } else {
        reactions[emoji].push(user.id);
    }

    return prisma.roastCard.update({
        where: { id: postId },
        data: { reactionsJson: JSON.stringify(reactions) }
    });
}

export async function incrementShareCount(postId: string) {
    return prisma.roastCard.update({
        where: { id: postId },
        data: { shareCount: { increment: 1 } }
    });
}

export async function getSocialComments(postId?: string) {
    if (postId) {
        return prisma.socialComment.findMany({
            where: { postId },
            orderBy: { createdAt: 'desc' }
        });
    }
    return prisma.socialComment.findMany({
        orderBy: { createdAt: 'desc' }
    });
}

export async function addSocialComment(data: Omit<SocialComment, "id" | "createdAt" | "reactions" | "reactionsJson">) {
    const user = await getUser();
    if (!user) throw new Error("Unauthorized");
    return prisma.socialComment.create({
        data: {
            postId: data.postId,
            userId: user.id,
            username: data.username,
            avatarGradient: data.avatarGradient,
            text: data.text,
            parentId: data.parentId
        }
    });
}

export async function getSocialProfile(userId?: string) {
    const targetId = userId || (await getUser())?.id;
    if (!targetId) return null;
    return prisma.socialProfile.findUnique({ where: { userId: targetId } });
}

export async function saveSocialProfile(data: Partial<SocialProfile>) {
    const user = await getUser();
    if (!user) throw new Error("Unauthorized");

    return prisma.socialProfile.upsert({
        where: { userId: user.id },
        create: {
            userId: user.id,
            displayName: data.displayName || user.name,
            bio: data.bio || "",
            avatarGradient: data.avatarGradient || 0,
            score: data.score || 0,
            streak: data.streak || 0,
            postCount: data.postCount || 0,
            badgesJson: JSON.stringify(data.badges || []),
        },
        update: {
            displayName: data.displayName,
            bio: data.bio,
            avatarGradient: data.avatarGradient,
            score: data.score,
            streak: data.streak,
            postCount: data.postCount,
            badgesJson: data.badges ? JSON.stringify(data.badges) : undefined,
        }
    });
}

export async function getNotifications() {
    const user = await getUser();
    if (!user) return [];
    return prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
    });
}

export async function addCategory(data: Omit<Category, "id" | "userId">) {
    const user = await getUser();
    if (!user) throw new Error("Unauthorized");
    return prisma.category.create({
        data: {
            ...data,
            userId: user.id,
            isDefault: false
        }
    });
}

