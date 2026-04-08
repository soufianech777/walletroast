import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date))
}

export function getMonthDays(): { elapsed: number; remaining: number; total: number } {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const total = new Date(year, month + 1, 0).getDate()
  const elapsed = now.getDate()
  const remaining = total - elapsed
  return { elapsed, remaining, total }
}

export function getScoreLabel(score: number): { label: string; color: string } {
  if (score >= 90) return { label: "Excellent", color: "text-emerald-400" }
  if (score >= 70) return { label: "Controlled", color: "text-blue-400" }
  if (score >= 50) return { label: "Slipping", color: "text-yellow-400" }
  if (score >= 30) return { label: "Risky", color: "text-orange-400" }
  return { label: "Chaos", color: "text-red-400" }
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}
