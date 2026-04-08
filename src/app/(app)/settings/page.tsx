"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  User, DollarSign, Flame, CreditCard, Trash2, Check, Crown, Camera,
  Phone, Shield, ShieldCheck, MapPin, Calendar, FileText, Copy, X,
  Eye, EyeOff, CheckCircle2, AlertTriangle, Smartphone, KeyRound, Lock,
  Briefcase, Home, Target, Wallet, Users, PiggyBank, Banknote, Sun, Moon, Monitor,
  Bell, BellOff, Mail, Volume2, VolumeX, Clock
} from "lucide-react"
import { getUser, saveUser } from "@/lib/store"
import { useRouter } from "next/navigation"
import type { RoastLevel, EmploymentStatus, HousingStatus, FinancialGoal, PaymentMethod } from "@/lib/types"

const currencies = ["USD", "EUR", "GBP", "MAD", "CAD", "AUD"]
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } }

// Generate a TOTP secret (Base32)
function generateSecret(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
  let secret = ""
  for (let i = 0; i < 16; i++) secret += chars[Math.floor(Math.random() * chars.length)]
  return secret
}

// Format secret for display
function formatSecret(secret: string): string {
  return secret.match(/.{1,4}/g)?.join("-") || secret
}

// Build otpauth URI for TOTP
function buildOtpAuthUri(secret: string, email: string): string {
  return `otpauth://totp/WalletRoast:${encodeURIComponent(email)}?secret=${secret}&issuer=WalletRoast&algorithm=SHA1&digits=6&period=30`
}

// Get QR code image URL from public API
function getQrCodeUrl(data: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}&bgcolor=ffffff&color=1a1a1a&margin=8`
}

export default function SettingsPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null)
  const [mounted, setMounted] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<"profile" | "financial" | "security" | "notifications">("profile")

  // Notification preferences
  const [notifDailyRoasts, setNotifDailyRoasts] = useState(true)
  const [notifBudgetAlerts, setNotifBudgetAlerts] = useState(true)
  const [notifSocialActivity, setNotifSocialActivity] = useState(true)
  const [notifAchievements, setNotifAchievements] = useState(true)
  const [notifSpendingAlerts, setNotifSpendingAlerts] = useState(true)
  const [notifSmartTips, setNotifSmartTips] = useState(false)
  const [notifWeeklyReport, setNotifWeeklyReport] = useState(true)
  const [notifGoalProgress, setNotifGoalProgress] = useState(true)
  const [pushEnabled, setPushEnabled] = useState(true)
  const [emailDigest, setEmailDigest] = useState<"off" | "daily" | "weekly">("weekly")
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false)
  const [quietHoursStart, setQuietHoursStart] = useState("22:00")
  const [quietHoursEnd, setQuietHoursEnd] = useState("08:00")
  const [notifSound, setNotifSound] = useState(true)
  
  // Profile fields
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [bio, setBio] = useState("")
  const [location, setLocation] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [profilePhoto, setProfilePhoto] = useState<string | undefined>()
  
  // Financial fields
  const [currency, setCurrency] = useState("USD")
  const [monthlyIncome, setMonthlyIncome] = useState("")
  const [savingsGoal, setSavingsGoal] = useState("")
  const [roastLevel, setRoastLevel] = useState<RoastLevel>("direct")
  const [employmentStatus, setEmploymentStatus] = useState<EmploymentStatus | "">("")
  const [industry, setIndustry] = useState("")
  const [housingStatus, setHousingStatus] = useState<HousingStatus | "">("")
  const [financialGoal, setFinancialGoal] = useState<FinancialGoal | "">("")
  const [monthlyExpenses, setMonthlyExpenses] = useState("")
  const [dependents, setDependents] = useState("")
  const [hasEmergencyFund, setHasEmergencyFund] = useState<boolean | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("")
  
  // 2FA fields
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [show2FASetup, setShow2FASetup] = useState(false)
  const [twoFASecret, setTwoFASecret] = useState("")
  const [twoFACode, setTwoFACode] = useState("")
  const [twoFAError, setTwoFAError] = useState("")
  const [twoFASuccess, setTwoFASuccess] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [secretCopied, setSecretCopied] = useState(false)
  
  // Phone verification
  const [showPhoneVerify, setShowPhoneVerify] = useState(false)
  const [phoneCode, setPhoneCode] = useState("")
  const [phoneSent, setPhoneSent] = useState(false)
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [phoneError, setPhoneError] = useState("")

  // Password change
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [pwError, setPwError] = useState("")
  const [pwSuccess, setPwSuccess] = useState(false)

  // Theme
  const [theme, setTheme] = useState<"dark" | "light">("dark")

  useEffect(() => {
    const u = getUser()
    if (u) {
      setUser(u)
      setName(u.name)
      setEmail(u.email)
      setPhone(u.phone || "")
      setBio(u.bio || "")
      setLocation(u.location || "")
      setDateOfBirth(u.dateOfBirth || "")
      setProfilePhoto(u.profilePhoto)
      setCurrency(u.currency)
      setMonthlyIncome(String(u.monthlyIncome))
      setSavingsGoal(String(u.savingsGoal))
      setRoastLevel(u.roastLevel)
      setEmploymentStatus(u.employmentStatus || "")
      setIndustry(u.industry || "")
      setHousingStatus(u.housingStatus || "")
      setFinancialGoal(u.financialGoal || "")
      setMonthlyExpenses(u.monthlyExpenses ? String(u.monthlyExpenses) : "")
      setDependents(u.dependents !== undefined ? String(u.dependents) : "")
      setHasEmergencyFund(u.hasEmergencyFund ?? null)
      setPaymentMethod(u.paymentMethod || "")
      setTwoFactorEnabled(u.twoFactorEnabled || false)
      setPhoneVerified(!!u.phone)
    }
    setMounted(true)

    // Load theme
    const savedTheme = localStorage.getItem("walletroast_theme") as "dark" | "light" | null
    if (savedTheme) setTheme(savedTheme)

    // Load notification preferences
    const notifPrefs = localStorage.getItem("walletroast_notif_prefs")
    if (notifPrefs) {
      try {
        const prefs = JSON.parse(notifPrefs)
        if (prefs.dailyRoasts !== undefined) setNotifDailyRoasts(prefs.dailyRoasts)
        if (prefs.budgetAlerts !== undefined) setNotifBudgetAlerts(prefs.budgetAlerts)
        if (prefs.socialActivity !== undefined) setNotifSocialActivity(prefs.socialActivity)
        if (prefs.achievements !== undefined) setNotifAchievements(prefs.achievements)
        if (prefs.spendingAlerts !== undefined) setNotifSpendingAlerts(prefs.spendingAlerts)
        if (prefs.smartTips !== undefined) setNotifSmartTips(prefs.smartTips)
        if (prefs.weeklyReport !== undefined) setNotifWeeklyReport(prefs.weeklyReport)
        if (prefs.goalProgress !== undefined) setNotifGoalProgress(prefs.goalProgress)
        if (prefs.pushEnabled !== undefined) setPushEnabled(prefs.pushEnabled)
        if (prefs.emailDigest) setEmailDigest(prefs.emailDigest)
        if (prefs.quietHoursEnabled !== undefined) setQuietHoursEnabled(prefs.quietHoursEnabled)
        if (prefs.quietHoursStart) setQuietHoursStart(prefs.quietHoursStart)
        if (prefs.quietHoursEnd) setQuietHoursEnd(prefs.quietHoursEnd)
        if (prefs.notifSound !== undefined) setNotifSound(prefs.notifSound)
      } catch { /* ignore parse errors */ }
    }
  }, [])

  const handleThemeChange = (newTheme: "dark" | "light") => {
    setTheme(newTheme)
    localStorage.setItem("walletroast_theme", newTheme)
    document.documentElement.className = newTheme === "light" ? "theme-light" : ""
  }

  const handleSave = () => {
    if (!user) return
    const updated = {
      ...user, name, email, phone, bio, location, dateOfBirth, profilePhoto,
      currency, monthlyIncome: Number(monthlyIncome), savingsGoal: Number(savingsGoal),
      roastLevel, twoFactorEnabled,
      employmentStatus: employmentStatus || undefined,
      industry: industry || undefined,
      housingStatus: housingStatus || undefined,
      financialGoal: financialGoal || undefined,
      monthlyExpenses: monthlyExpenses ? Number(monthlyExpenses) : undefined,
      dependents: dependents ? Number(dependents) : undefined,
      hasEmergencyFund: hasEmergencyFund ?? undefined,
      paymentMethod: paymentMethod || undefined,
      updatedAt: new Date()
    }
    saveUser(updated)
    setUser(updated)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { alert("Image must be under 2MB"); return }
    const reader = new FileReader()
    reader.onloadend = () => setProfilePhoto(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleRemovePhoto = () => {
    setProfilePhoto(undefined)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSendPhoneCode = () => {
    if (!phone || phone.length < 8) { setPhoneError("Enter a valid phone number"); return }
    setPhoneError("")
    setPhoneSent(true)
  }

  const handleVerifyPhone = () => {
    if (phoneCode.length === 6) {
      setPhoneVerified(true)
      setShowPhoneVerify(false)
      setPhoneCode("")
      setPhoneSent(false)
    } else {
      setPhoneError("Invalid code. For demo, use any 6 digits.")
    }
  }

  const handleEnable2FA = () => {
    const secret = generateSecret()
    setTwoFASecret(secret)
    const otpUri = buildOtpAuthUri(secret, email || "user@walletroast.com")
    setQrCodeUrl(getQrCodeUrl(otpUri))
    setShow2FASetup(true)
    setTwoFACode("")
    setTwoFAError("")
    setTwoFASuccess(false)
  }

  const handleVerify2FA = () => {
    if (twoFACode.length === 6) {
      setTwoFactorEnabled(true)
      setTwoFASuccess(true)
      setTwoFAError("")
      setTimeout(() => { setShow2FASetup(false); setTwoFASuccess(false) }, 1500)
    } else {
      setTwoFAError("Enter a valid 6-digit code. For demo, use any 6 digits.")
    }
  }

  const handleDisable2FA = () => {
    if (confirm("Disable two-factor authentication? This will reduce your account security.")) {
      setTwoFactorEnabled(false)
      setTwoFASecret("")
    }
  }

  const handleCopySecret = () => {
    navigator.clipboard.writeText(twoFASecret)
    setSecretCopied(true)
    setTimeout(() => setSecretCopied(false), 2000)
  }

  const handleChangePassword = () => {
    setPwError("")
    setPwSuccess(false)

    if (!currentPassword) { setPwError("Enter your current password"); return }
    if (newPassword.length < 8) { setPwError("New password must be at least 8 characters"); return }
    if (!/[A-Z]/.test(newPassword)) { setPwError("Must contain at least one uppercase letter"); return }
    if (!/[0-9]/.test(newPassword)) { setPwError("Must contain at least one number"); return }
    if (newPassword !== confirmPassword) { setPwError("New passwords don't match"); return }
    if (currentPassword === newPassword) { setPwError("New password must be different from current"); return }

    // Simulate password change
    setPwSuccess(true)
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setTimeout(() => setPwSuccess(false), 3000)
  }

  const handleClearData = () => {
    if (confirm("Delete ALL your data? This cannot be undone.")) { localStorage.clear(); router.push("/") }
  }

  if (!mounted || !user) return <div className="animate-pulse"><div className="h-96 bg-[var(--color-secondary)] rounded-2xl" /></div>

  const roastOptions: { level: RoastLevel; emoji: string; label: string; desc: string }[] = [
    { level: "soft", emoji: "😊", label: "Soft", desc: "Gentle nudges" },
    { level: "direct", emoji: "😐", label: "Direct", desc: "Clear instructions" },
    { level: "brutal", emoji: "🔥", label: "Brutal", desc: "No mercy" },
  ]

  const tabs = [
    { id: "profile" as const, label: "Profile", icon: User },
    { id: "financial" as const, label: "Financial", icon: DollarSign },
    { id: "notifications" as const, label: "Notifications", icon: Bell },
    { id: "security" as const, label: "Security", icon: Shield },
  ]

  const saveNotifPrefs = (overrides: Record<string, unknown> = {}) => {
    const prefs = {
      dailyRoasts: notifDailyRoasts,
      budgetAlerts: notifBudgetAlerts,
      socialActivity: notifSocialActivity,
      achievements: notifAchievements,
      spendingAlerts: notifSpendingAlerts,
      smartTips: notifSmartTips,
      weeklyReport: notifWeeklyReport,
      goalProgress: notifGoalProgress,
      pushEnabled,
      emailDigest,
      quietHoursEnabled,
      quietHoursStart,
      quietHoursEnd,
      notifSound,
      ...overrides,
    }
    localStorage.setItem("walletroast_notif_prefs", JSON.stringify(prefs))
  }

  const notifCategories = [
    { key: "dailyRoasts", label: "Daily Roasts", emoji: "🔥", desc: "Your daily roast card", color: "orange", enabled: notifDailyRoasts, toggle: () => { setNotifDailyRoasts(v => !v); saveNotifPrefs({ dailyRoasts: !notifDailyRoasts }) } },
    { key: "budgetAlerts", label: "Budget Alerts", emoji: "💰", desc: "When you exceed limits", color: "red", enabled: notifBudgetAlerts, toggle: () => { setNotifBudgetAlerts(v => !v); saveNotifPrefs({ budgetAlerts: !notifBudgetAlerts }) } },
    { key: "socialActivity", label: "Social Activity", emoji: "💬", desc: "Comments & reactions", color: "blue", enabled: notifSocialActivity, toggle: () => { setNotifSocialActivity(v => !v); saveNotifPrefs({ socialActivity: !notifSocialActivity }) } },
    { key: "achievements", label: "Achievements", emoji: "🏆", desc: "Badges & milestones", color: "amber", enabled: notifAchievements, toggle: () => { setNotifAchievements(v => !v); saveNotifPrefs({ achievements: !notifAchievements }) } },
    { key: "spendingAlerts", label: "Spending Alerts", emoji: "⚠️", desc: "Unusual spending", color: "red", enabled: notifSpendingAlerts, toggle: () => { setNotifSpendingAlerts(v => !v); saveNotifPrefs({ spendingAlerts: !notifSpendingAlerts }) } },
    { key: "weeklyReport", label: "Weekly Report", emoji: "📊", desc: "Sunday summaries", color: "purple", enabled: notifWeeklyReport, toggle: () => { setNotifWeeklyReport(v => !v); saveNotifPrefs({ weeklyReport: !notifWeeklyReport }) } },
    { key: "goalProgress", label: "Goal Progress", emoji: "🎯", desc: "Goal milestones", color: "emerald", enabled: notifGoalProgress, toggle: () => { setNotifGoalProgress(v => !v); saveNotifPrefs({ goalProgress: !notifGoalProgress }) } },
    { key: "smartTips", label: "Smart Tips", emoji: "💡", desc: "Saving suggestions", color: "emerald", enabled: notifSmartTips, toggle: () => { setNotifSmartTips(v => !v); saveNotifPrefs({ smartTips: !notifSmartTips }) } },
  ]

  const profileCompleteness = [name, email, phone, bio, location, dateOfBirth, profilePhoto].filter(Boolean).length
  const completenessPercent = Math.round((profileCompleteness / 7) * 100)

  // Password strength
  const pwStrength = (() => {
    if (!newPassword) return { score: 0, label: "", color: "" }
    let s = 0
    if (newPassword.length >= 8) s++
    if (newPassword.length >= 12) s++
    if (/[A-Z]/.test(newPassword)) s++
    if (/[0-9]/.test(newPassword)) s++
    if (/[^A-Za-z0-9]/.test(newPassword)) s++
    if (s <= 1) return { score: 1, label: "Weak", color: "#ef4444" }
    if (s <= 2) return { score: 2, label: "Fair", color: "#f59e0b" }
    if (s <= 3) return { score: 3, label: "Good", color: "#fb923c" }
    if (s <= 4) return { score: 4, label: "Strong", color: "#10b981" }
    return { score: 5, label: "Excellent", color: "#059669" }
  })()

  return (
    <motion.div className="space-y-6 max-w-3xl" initial="hidden" animate="visible" variants={stagger}>
      {/* Header */}
      <motion.div variants={fadeUp}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-orange-400 uppercase tracking-[0.2em] mb-1">Settings</p>
            <h1 className="text-2xl sm:text-[1.75rem] font-bold tracking-tight">Your Preferences</h1>
            <p className="text-[var(--color-muted-foreground)] text-xs mt-1">Manage your profile, finances, and security</p>
          </div>
          <button onClick={() => handleThemeChange(theme === "dark" ? "light" : "dark")}
            className="w-10 h-10 rounded-xl border border-[var(--color-border)] hover:border-orange-500/40 hover:bg-orange-500/10 flex items-center justify-center transition-all duration-200 mt-1"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}>
            {theme === "dark" ? <Moon className="w-[18px] h-[18px] text-orange-400" /> : <Sun className="w-[18px] h-[18px] text-amber-500" />}
          </button>
        </div>
      </motion.div>

      {/* PROFILE HERO CARD */}
      <motion.div variants={fadeUp}>
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-orange-600/30 via-red-500/20 to-orange-500/30 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-card)]/80 to-transparent" />
          </div>
          <div className="px-6 pb-6 -mt-12 relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <div className="relative group">
                <div className={`w-24 h-24 rounded-2xl border-4 overflow-hidden flex items-center justify-center shadow-xl ${
                  user.subscriptionPlan === "pro"
                    ? "border-amber-400 shadow-amber-500/30 ring-2 ring-amber-400/50"
                    : "border-[var(--color-card)] shadow-orange-500/20"
                }`}
                  style={{
                    background: user.subscriptionPlan === "pro"
                      ? "linear-gradient(135deg, #f59e0b, #d97706)"
                      : "linear-gradient(135deg, #f97316, #ea580c)"
                  }}
                >
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-white">{name?.charAt(0)?.toUpperCase() || "U"}</span>
                  )}
                </div>
                {/* Pro Crown Badge */}
                {user.subscriptionPlan === "pro" && (
                  <div className="absolute -top-3 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/40 animate-pulse z-10" style={{ animationDuration: "3s" }}>
                    <Crown className="w-4 h-4 text-amber-900" />
                  </div>
                )}
                <button onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center cursor-pointer">
                  <Camera className="w-6 h-6 text-white" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                {profilePhoto && (
                  <button onClick={handleRemovePhoto}
                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg">
                    <X className="w-3 h-3 text-white" />
                  </button>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{name || "Your Name"}</h2>
                <p className="text-sm text-[var(--color-muted-foreground)]">{email}</p>
              </div>
              <div className="sm:text-right">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-semibold text-[var(--color-muted-foreground)]">Profile Completeness</span>
                  <span className={`text-[11px] font-bold ${completenessPercent === 100 ? "text-green-400" : "text-orange-400"}`}>{completenessPercent}%</span>
                </div>
                <div className="w-40 h-1.5 bg-[var(--color-secondary)] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${completenessPercent}%`, background: completenessPercent === 100 ? "linear-gradient(90deg, #10b981, #34d399)" : "linear-gradient(90deg, #f97316, #fb923c)" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div variants={fadeUp}>
        <div className="flex gap-1 p-1 bg-[var(--color-secondary)] rounded-xl">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold transition-all duration-200 ${
                activeTab === tab.id ? "bg-[var(--color-card)] text-orange-400 shadow-sm" : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
              }`}>
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.id === "security" && twoFactorEnabled && <span className="w-2 h-2 rounded-full bg-green-400" />}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ═══ PROFILE TAB ═══ */}
      <AnimatePresence mode="wait">
        {activeTab === "profile" && (
          <motion.div key="profile" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }} className="space-y-5">
            {/* Personal Info */}
            <div className="glass-card p-6 rounded-2xl">
              <h2 className="font-bold text-[15px] flex items-center gap-2.5 mb-5">
                <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center"><User className="w-4 h-4 text-orange-400" /></div>
                Personal Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] text-[var(--color-muted-foreground)] mb-1.5 font-medium">Full Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full input-premium" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-[12px] text-[var(--color-muted-foreground)] mb-1.5 font-medium">Email Address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full input-premium" placeholder="you@example.com" />
                </div>
                <div>
                  <label className="block text-[12px] text-[var(--color-muted-foreground)] mb-1.5 font-medium flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" /> Location
                  </label>
                  <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full input-premium" placeholder="City, Country" />
                </div>
                <div>
                  <label className="block text-[12px] text-[var(--color-muted-foreground)] mb-1.5 font-medium flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" /> Date of Birth
                  </label>
                  <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="w-full input-premium" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[12px] text-[var(--color-muted-foreground)] mb-1.5 font-medium flex items-center gap-1.5">
                    <FileText className="w-3 h-3" /> Bio
                  </label>
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
                    className="w-full input-premium resize-none" placeholder="Tell us about yourself... (e.g. 'Trying to stop spending on coffee ☕')" />
                </div>
              </div>
            </div>

            {/* Phone Number */}
            <div className="glass-card p-6 rounded-2xl">
              <h2 className="font-bold text-[15px] flex items-center gap-2.5 mb-5">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center"><Phone className="w-4 h-4 text-blue-400" /></div>
                Phone Number
                {phoneVerified && phone && (
                  <span className="ml-auto text-[11px] font-semibold text-green-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Verified</span>
                )}
              </h2>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <input type="tel" value={phone} onChange={(e) => { setPhone(e.target.value); setPhoneVerified(false) }}
                    className="flex-1 input-premium" placeholder="+1 (555) 000-0000" />
                  {!phoneVerified && phone && (
                    <button onClick={() => { setShowPhoneVerify(true); handleSendPhoneCode() }}
                      className="btn-primary px-4 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap">Verify</button>
                  )}
                </div>
                <p className="text-[11px] text-[var(--color-muted-foreground)]">Used for account recovery and 2FA. We&apos;ll send a verification code.</p>
                <AnimatePresence>
                  {showPhoneVerify && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="p-4 bg-[var(--color-secondary)] rounded-xl border border-[var(--color-border)] space-y-3">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-orange-400" />
                          <span className="text-[13px] font-semibold">Verify your phone</span>
                        </div>
                        {phoneSent && (
                          <p className="text-[12px] text-[var(--color-muted-foreground)]">
                            A 6-digit code was sent to <span className="font-semibold text-[var(--color-foreground)]">{phone}</span>
                          </p>
                        )}
                        <div className="flex gap-2">
                          <input type="text" value={phoneCode} onChange={(e) => setPhoneCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            maxLength={6} className="flex-1 input-premium text-center tracking-[0.5em] text-lg font-mono" placeholder="000000" />
                          <button onClick={handleVerifyPhone} className="btn-primary px-5 py-2 rounded-xl text-[13px] font-semibold">Confirm</button>
                        </div>
                        {phoneError && <p className="text-[11px] text-red-400">{phoneError}</p>}
                        <button onClick={() => setShowPhoneVerify(false)} className="text-[11px] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]">Cancel</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══ FINANCIAL TAB ═══ */}
        {activeTab === "financial" && (
          <motion.div key="financial" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }} className="space-y-5">

            {/* ─── Employment & Situation ─── */}
            <div className="glass-card p-6 rounded-2xl">
              <h2 className="font-bold text-[15px] flex items-center gap-2.5 mb-5">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center"><Briefcase className="w-4 h-4 text-blue-400" /></div>
                Employment & Situation
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-[12px] text-[var(--color-muted-foreground)] mb-2 font-medium">Employment Status</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {([
                      { value: "student", emoji: "🎓", label: "Student" },
                      { value: "salaried", emoji: "💼", label: "Salaried" },
                      { value: "freelancer", emoji: "💻", label: "Freelancer" },
                      { value: "business_owner", emoji: "🏢", label: "Business Owner" },
                      { value: "unemployed", emoji: "🔍", label: "Unemployed" },
                      { value: "retired", emoji: "🏖️", label: "Retired" },
                      { value: "other", emoji: "📋", label: "Other" },
                    ] as { value: EmploymentStatus; emoji: string; label: string }[]).map(opt => (
                      <button key={opt.value} onClick={() => setEmploymentStatus(opt.value)}
                        className={`p-3 rounded-xl border text-center transition-all duration-200 hover:-translate-y-0.5 ${
                          employmentStatus === opt.value ? "border-orange-500/40 bg-orange-500/10 ring-1 ring-orange-500/20" : "border-[var(--color-border)] hover:border-[var(--color-border-hover)]"
                        }`}>
                        <div className="text-lg mb-1">{opt.emoji}</div>
                        <p className="text-[11px] font-semibold">{opt.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] text-[var(--color-muted-foreground)] mb-1.5 font-medium flex items-center gap-1.5">
                      <Briefcase className="w-3 h-3" /> Industry / Field
                    </label>
                    <input type="text" value={industry} onChange={(e) => setIndustry(e.target.value)}
                      className="w-full input-premium" placeholder="e.g. Technology, Healthcare, Education..." />
                  </div>
                  <div>
                    <label className="block text-[12px] text-[var(--color-muted-foreground)] mb-1.5 font-medium flex items-center gap-1.5">
                      <Users className="w-3 h-3" /> Financial Dependents
                    </label>
                    <input type="number" min="0" value={dependents} onChange={(e) => setDependents(e.target.value)}
                      className="w-full input-premium" placeholder="0" />
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Housing ─── */}
            <div className="glass-card p-6 rounded-2xl">
              <h2 className="font-bold text-[15px] flex items-center gap-2.5 mb-5">
                <div className="w-7 h-7 rounded-lg bg-green-500/10 flex items-center justify-center"><Home className="w-4 h-4 text-green-400" /></div>
                Housing Situation
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {([
                  { value: "renting", emoji: "🏠", label: "Renting" },
                  { value: "own_home", emoji: "🏡", label: "Own Home" },
                  { value: "mortgage", emoji: "🏦", label: "Mortgage" },
                  { value: "living_with_family", emoji: "👨‍👩‍👧", label: "With Family" },
                  { value: "other", emoji: "🔑", label: "Other" },
                ] as { value: HousingStatus; emoji: string; label: string }[]).map(opt => (
                  <button key={opt.value} onClick={() => setHousingStatus(opt.value)}
                    className={`p-3 rounded-xl border text-center transition-all duration-200 hover:-translate-y-0.5 ${
                      housingStatus === opt.value ? "border-green-500/40 bg-green-500/10 ring-1 ring-green-500/20" : "border-[var(--color-border)] hover:border-[var(--color-border-hover)]"
                    }`}>
                    <div className="text-lg mb-1">{opt.emoji}</div>
                    <p className="text-[11px] font-semibold">{opt.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* ─── Income & Expenses ─── */}
            <div className="glass-card p-6 rounded-2xl">
              <h2 className="font-bold text-[15px] flex items-center gap-2.5 mb-5">
                <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center"><Banknote className="w-4 h-4 text-orange-400" /></div>
                Income & Expenses
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-[12px] text-[var(--color-muted-foreground)] mb-1.5 font-medium">Currency</label>
                  <div className="flex flex-wrap gap-2">
                    {currencies.map(c => (
                      <button key={c} onClick={() => setCurrency(c)}
                        className={`px-4 py-2 rounded-xl border text-[13px] font-medium transition-all duration-200 ${
                          currency === c ? "border-orange-500/40 bg-orange-500/10 text-orange-400" : "border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:border-[var(--color-border-hover)]"
                        }`}>{c}</button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[12px] text-[var(--color-muted-foreground)] mb-1.5 font-medium flex items-center gap-1.5">
                      <DollarSign className="w-3 h-3 text-green-400" /> Monthly Income
                    </label>
                    <input type="number" value={monthlyIncome} onChange={(e) => setMonthlyIncome(e.target.value)} className="w-full input-premium" placeholder="3000" />
                  </div>
                  <div>
                    <label className="block text-[12px] text-[var(--color-muted-foreground)] mb-1.5 font-medium flex items-center gap-1.5">
                      <Wallet className="w-3 h-3 text-red-400" /> Monthly Expenses
                    </label>
                    <input type="number" value={monthlyExpenses} onChange={(e) => setMonthlyExpenses(e.target.value)} className="w-full input-premium" placeholder="2000" />
                  </div>
                  <div>
                    <label className="block text-[12px] text-[var(--color-muted-foreground)] mb-1.5 font-medium flex items-center gap-1.5">
                      <PiggyBank className="w-3 h-3 text-orange-400" /> Savings Goal
                    </label>
                    <input type="number" value={savingsGoal} onChange={(e) => setSavingsGoal(e.target.value)} className="w-full input-premium" placeholder="500" />
                  </div>
                </div>
                {monthlyIncome && monthlyExpenses && (
                  <div className="p-3 bg-[var(--color-secondary)] rounded-xl">
                    <div className="flex justify-between text-[12px]">
                      <span className="text-[var(--color-muted-foreground)]">Estimated monthly surplus</span>
                      <span className={`font-bold ${Number(monthlyIncome) - Number(monthlyExpenses) >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {Number(monthlyIncome) - Number(monthlyExpenses) >= 0 ? "+" : ""}{currency === "MAD" ? "MAD" : "$"}{Number(monthlyIncome) - Number(monthlyExpenses)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ─── Financial Goal ─── */}
            <div className="glass-card p-6 rounded-2xl">
              <h2 className="font-bold text-[15px] flex items-center gap-2.5 mb-5">
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center"><Target className="w-4 h-4 text-purple-400" /></div>
                Primary Financial Goal
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {([
                  { value: "save_more", emoji: "💰", label: "Save More" },
                  { value: "pay_debt", emoji: "💳", label: "Pay Off Debt" },
                  { value: "invest", emoji: "📈", label: "Start Investing" },
                  { value: "emergency_fund", emoji: "🛡️", label: "Emergency Fund" },
                  { value: "buy_home", emoji: "🏠", label: "Buy a Home" },
                  { value: "retirement", emoji: "🏖️", label: "Retirement" },
                  { value: "travel", emoji: "✈️", label: "Travel" },
                  { value: "education", emoji: "📚", label: "Education" },
                ] as { value: FinancialGoal; emoji: string; label: string }[]).map(opt => (
                  <button key={opt.value} onClick={() => setFinancialGoal(opt.value)}
                    className={`p-3 rounded-xl border text-center transition-all duration-200 hover:-translate-y-0.5 ${
                      financialGoal === opt.value ? "border-purple-500/40 bg-purple-500/10 ring-1 ring-purple-500/20" : "border-[var(--color-border)] hover:border-[var(--color-border-hover)]"
                    }`}>
                    <div className="text-lg mb-1">{opt.emoji}</div>
                    <p className="text-[11px] font-semibold">{opt.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* ─── Payment & Safety ─── */}
            <div className="glass-card p-6 rounded-2xl">
              <h2 className="font-bold text-[15px] flex items-center gap-2.5 mb-5">
                <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center"><CreditCard className="w-4 h-4 text-orange-400" /></div>
                Payment & Safety Net
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-[12px] text-[var(--color-muted-foreground)] mb-2 font-medium">Primary Payment Method</label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {([
                      { value: "cash", emoji: "💵", label: "Cash" },
                      { value: "debit_card", emoji: "💳", label: "Debit Card" },
                      { value: "credit_card", emoji: "🏧", label: "Credit Card" },
                      { value: "mobile_payment", emoji: "📱", label: "Mobile Pay" },
                      { value: "mixed", emoji: "🔄", label: "Mixed" },
                    ] as { value: PaymentMethod; emoji: string; label: string }[]).map(opt => (
                      <button key={opt.value} onClick={() => setPaymentMethod(opt.value)}
                        className={`p-2.5 rounded-xl border text-center transition-all duration-200 hover:-translate-y-0.5 ${
                          paymentMethod === opt.value ? "border-orange-500/40 bg-orange-500/10 ring-1 ring-orange-500/20" : "border-[var(--color-border)] hover:border-[var(--color-border-hover)]"
                        }`}>
                        <div className="text-base mb-0.5">{opt.emoji}</div>
                        <p className="text-[10px] font-semibold">{opt.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[12px] text-[var(--color-muted-foreground)] mb-2 font-medium">Do you have an emergency fund?</label>
                  <div className="flex gap-2">
                    <button onClick={() => setHasEmergencyFund(true)}
                      className={`flex-1 p-3 rounded-xl border text-center transition-all duration-200 ${
                        hasEmergencyFund === true ? "border-green-500/40 bg-green-500/10 ring-1 ring-green-500/20" : "border-[var(--color-border)] hover:border-[var(--color-border-hover)]"
                      }`}>
                      <div className="text-lg mb-0.5">✅</div>
                      <p className="text-[11px] font-semibold">Yes</p>
                      <p className="text-[9px] text-[var(--color-muted-foreground)]">3+ months covered</p>
                    </button>
                    <button onClick={() => setHasEmergencyFund(false)}
                      className={`flex-1 p-3 rounded-xl border text-center transition-all duration-200 ${
                        hasEmergencyFund === false ? "border-red-500/40 bg-red-500/10 ring-1 ring-red-500/20" : "border-[var(--color-border)] hover:border-[var(--color-border-hover)]"
                      }`}>
                      <div className="text-lg mb-0.5">❌</div>
                      <p className="text-[11px] font-semibold">No</p>
                      <p className="text-[9px] text-[var(--color-muted-foreground)]">Building one</p>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Roast Level ─── */}
            <div className="glass-card p-6 rounded-2xl">
              <h2 className="font-bold text-[15px] flex items-center gap-2.5 mb-5">
                <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center"><Flame className="w-4 h-4 text-orange-400" /></div>
                Roast Level
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {roastOptions.map(opt => (
                  <button key={opt.level} onClick={() => setRoastLevel(opt.level)}
                    className={`p-4 rounded-xl border text-center transition-all duration-200 hover:-translate-y-0.5 ${
                      roastLevel === opt.level ? "border-orange-500/40 bg-orange-500/10 ring-1 ring-orange-500/20" : "border-[var(--color-border)] hover:border-[var(--color-border-hover)]"
                    }`}>
                    <div className="text-2xl mb-1.5">{opt.emoji}</div>
                    <p className="text-[13px] font-semibold">{opt.label}</p>
                    <p className="text-[10px] text-[var(--color-muted-foreground)] mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* ─── Subscription ─── */}
            <div className="glass-card p-6 rounded-2xl">
              <h2 className="font-bold text-[15px] flex items-center gap-2.5 mb-5">
                <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center"><Crown className="w-4 h-4 text-orange-400" /></div>
                Subscription
              </h2>
              <div className="flex items-center justify-between p-4 bg-[var(--color-secondary)] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 rounded-full text-[11px] font-bold ${user.subscriptionPlan === "pro" ? "bg-orange-500/15 text-orange-400" : "bg-[var(--color-border)] text-[var(--color-muted-foreground)]"}`}>
                    {user.subscriptionPlan === "pro" ? "PRO" : "FREE"}
                  </div>
                  <span className="text-[13px]">{user.subscriptionPlan === "pro" ? "All features unlocked" : "Basic plan"}</span>
                </div>
                {user.subscriptionPlan !== "pro" && (
                  <button onClick={() => router.push("/#pricing")} className="btn-primary px-4 py-2 rounded-xl text-[13px] font-semibold flex items-center gap-1.5"><Crown className="w-3.5 h-3.5" /> Upgrade</button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══ NOTIFICATIONS TAB ═══ */}
        {activeTab === "notifications" && (
          <motion.div key="notifications" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }} className="space-y-5">

            {/* ─── Push Notifications ─── */}
            <div className="glass-card p-6 rounded-2xl">
              <h2 className="font-bold text-[15px] flex items-center gap-2.5 mb-2">
                <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  {pushEnabled ? <Bell className="w-4 h-4 text-orange-400" /> : <BellOff className="w-4 h-4 text-zinc-500" />}
                </div>
                Push Notifications
                <span className={`ml-auto px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  pushEnabled ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" : "bg-zinc-500/15 text-zinc-400 border-zinc-500/20"
                }`}>{pushEnabled ? "ENABLED" : "DISABLED"}</span>
              </h2>
              <p className="text-[12px] text-[var(--color-muted-foreground)] mb-5 ml-[38px]">
                Receive real-time notifications about your spending and roasts.
              </p>
              <div className="flex items-center justify-between p-4 bg-[var(--color-secondary)] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    pushEnabled ? "bg-emerald-500/10" : "bg-zinc-500/10"
                  }`}>
                    {pushEnabled ? <Bell className="w-5 h-5 text-emerald-400" /> : <BellOff className="w-5 h-5 text-zinc-500" />}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold">{pushEnabled ? "Push notifications are on" : "Push notifications are off"}</p>
                    <p className="text-[11px] text-[var(--color-muted-foreground)]">{pushEnabled ? "You'll receive alerts on this device" : "You won't receive any push alerts"}</p>
                  </div>
                </div>
                <button onClick={() => { setPushEnabled(v => !v); saveNotifPrefs({ pushEnabled: !pushEnabled }) }}
                  className={`w-12 h-6 rounded-full transition-all duration-300 flex items-center ${
                    pushEnabled ? "bg-emerald-500 justify-end" : "bg-zinc-700 justify-start"
                  }`}>
                  <div className="w-5 h-5 rounded-full bg-white mx-0.5 shadow-md transition-all" />
                </button>
              </div>
            </div>

            {/* ─── Notification Categories ─── */}
            <div className="glass-card p-6 rounded-2xl">
              <h2 className="font-bold text-[15px] flex items-center gap-2.5 mb-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-blue-400" />
                </div>
                Notification Categories
              </h2>
              <p className="text-[12px] text-[var(--color-muted-foreground)] mb-5 ml-[38px]">
                Choose which types of notifications you want to receive.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {notifCategories.map((cat) => (
                  <button key={cat.key} onClick={cat.toggle}
                    className={`p-3.5 rounded-xl border text-left transition-all duration-200 hover:-translate-y-0.5 group ${
                      cat.enabled
                        ? `border-${cat.color}-500/25 bg-${cat.color}-500/[0.04]`
                        : "border-[var(--color-border)] bg-[var(--color-secondary)] opacity-60"
                    }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg">{cat.emoji}</span>
                      <div className={`w-8 h-[18px] rounded-full transition-all duration-300 flex items-center ${
                        cat.enabled ? "bg-orange-500 justify-end" : "bg-zinc-700 justify-start"
                      }`}>
                        <div className="w-3.5 h-3.5 rounded-full bg-white mx-0.5 shadow-sm" />
                      </div>
                    </div>
                    <p className="text-[11px] font-bold leading-tight">{cat.label}</p>
                    <p className="text-[9px] text-[var(--color-muted-foreground)] mt-0.5">{cat.desc}</p>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[var(--color-border)]">
                <button
                  onClick={() => {
                    setNotifDailyRoasts(true); setNotifBudgetAlerts(true); setNotifSocialActivity(true);
                    setNotifAchievements(true); setNotifSpendingAlerts(true); setNotifSmartTips(true);
                    setNotifWeeklyReport(true); setNotifGoalProgress(true);
                    saveNotifPrefs({ dailyRoasts: true, budgetAlerts: true, socialActivity: true, achievements: true, spendingAlerts: true, smartTips: true, weeklyReport: true, goalProgress: true })
                  }}
                  className="text-[11px] font-semibold text-orange-400 hover:text-orange-300 transition-colors">
                  Enable All
                </button>
                <span className="text-[var(--color-border)]">|</span>
                <button
                  onClick={() => {
                    setNotifDailyRoasts(false); setNotifBudgetAlerts(false); setNotifSocialActivity(false);
                    setNotifAchievements(false); setNotifSpendingAlerts(false); setNotifSmartTips(false);
                    setNotifWeeklyReport(false); setNotifGoalProgress(false);
                    saveNotifPrefs({ dailyRoasts: false, budgetAlerts: false, socialActivity: false, achievements: false, spendingAlerts: false, smartTips: false, weeklyReport: false, goalProgress: false })
                  }}
                  className="text-[11px] font-semibold text-[var(--color-muted-foreground)] hover:text-red-400 transition-colors">
                  Disable All
                </button>
              </div>
            </div>

            {/* ─── Sound & Vibration ─── */}
            <div className="glass-card p-6 rounded-2xl">
              <h2 className="font-bold text-[15px] flex items-center gap-2.5 mb-5">
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  {notifSound ? <Volume2 className="w-4 h-4 text-purple-400" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
                </div>
                Sound & Vibration
              </h2>
              <div className="flex items-center justify-between p-4 bg-[var(--color-secondary)] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    notifSound ? "bg-purple-500/10" : "bg-zinc-500/10"
                  }`}>
                    {notifSound ? <Volume2 className="w-5 h-5 text-purple-400" /> : <VolumeX className="w-5 h-5 text-zinc-500" />}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold">{notifSound ? "Notification sounds on" : "Notification sounds off"}</p>
                    <p className="text-[11px] text-[var(--color-muted-foreground)]">{notifSound ? "Play a sound for new notifications" : "Silent notifications only"}</p>
                  </div>
                </div>
                <button onClick={() => { setNotifSound(v => !v); saveNotifPrefs({ notifSound: !notifSound }) }}
                  className={`w-12 h-6 rounded-full transition-all duration-300 flex items-center ${
                    notifSound ? "bg-purple-500 justify-end" : "bg-zinc-700 justify-start"
                  }`}>
                  <div className="w-5 h-5 rounded-full bg-white mx-0.5 shadow-md transition-all" />
                </button>
              </div>
            </div>

            {/* ─── Quiet Hours ─── */}
            <div className="glass-card p-6 rounded-2xl">
              <h2 className="font-bold text-[15px] flex items-center gap-2.5 mb-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <Moon className="w-4 h-4 text-indigo-400" />
                </div>
                Quiet Hours
                {quietHoursEnabled && (
                  <span className="ml-auto px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">ACTIVE</span>
                )}
              </h2>
              <p className="text-[12px] text-[var(--color-muted-foreground)] mb-5 ml-[38px]">
                Pause notifications during specific hours. No buzzing at 3 AM! 😴
              </p>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[var(--color-secondary)] rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      quietHoursEnabled ? "bg-indigo-500/10" : "bg-zinc-500/10"
                    }`}>
                      <Moon className={`w-5 h-5 ${quietHoursEnabled ? "text-indigo-400" : "text-zinc-500"}`} />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold">{quietHoursEnabled ? "Quiet hours enabled" : "Quiet hours disabled"}</p>
                      <p className="text-[11px] text-[var(--color-muted-foreground)]">
                        {quietHoursEnabled ? `Silent from ${quietHoursStart} to ${quietHoursEnd}` : "All notifications come through anytime"}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => { setQuietHoursEnabled(v => !v); saveNotifPrefs({ quietHoursEnabled: !quietHoursEnabled }) }}
                    className={`w-12 h-6 rounded-full transition-all duration-300 flex items-center ${
                      quietHoursEnabled ? "bg-indigo-500 justify-end" : "bg-zinc-700 justify-start"
                    }`}>
                    <div className="w-5 h-5 rounded-full bg-white mx-0.5 shadow-md transition-all" />
                  </button>
                </div>
                <AnimatePresence>
                  {quietHoursEnabled && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="grid grid-cols-2 gap-4 p-4 bg-[var(--color-secondary)] rounded-xl border border-indigo-500/10">
                        <div>
                          <label className="block text-[12px] text-[var(--color-muted-foreground)] mb-1.5 font-medium flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-indigo-400" /> Start Time
                          </label>
                          <input type="time" value={quietHoursStart}
                            onChange={(e) => { setQuietHoursStart(e.target.value); saveNotifPrefs({ quietHoursStart: e.target.value }) }}
                            className="w-full input-premium" />
                        </div>
                        <div>
                          <label className="block text-[12px] text-[var(--color-muted-foreground)] mb-1.5 font-medium flex items-center gap-1.5">
                            <Sun className="w-3 h-3 text-amber-400" /> End Time
                          </label>
                          <input type="time" value={quietHoursEnd}
                            onChange={(e) => { setQuietHoursEnd(e.target.value); saveNotifPrefs({ quietHoursEnd: e.target.value }) }}
                            className="w-full input-premium" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* ─── Email Digest ─── */}
            <div className="glass-card p-6 rounded-2xl">
              <h2 className="font-bold text-[15px] flex items-center gap-2.5 mb-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-emerald-400" />
                </div>
                Email Digest
              </h2>
              <p className="text-[12px] text-[var(--color-muted-foreground)] mb-5 ml-[38px]">
                Get a summary of your notifications delivered to your inbox.
              </p>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { value: "off", emoji: "🚫", label: "Off", desc: "No emails" },
                  { value: "daily", emoji: "📅", label: "Daily", desc: "Every morning" },
                  { value: "weekly", emoji: "📬", label: "Weekly", desc: "Every Monday" },
                ] as { value: typeof emailDigest; emoji: string; label: string; desc: string }[]).map(opt => (
                  <button key={opt.value}
                    onClick={() => { setEmailDigest(opt.value); saveNotifPrefs({ emailDigest: opt.value }) }}
                    className={`p-4 rounded-xl border text-center transition-all duration-200 hover:-translate-y-0.5 ${
                      emailDigest === opt.value ? "border-emerald-500/40 bg-emerald-500/10 ring-1 ring-emerald-500/20" : "border-[var(--color-border)] hover:border-[var(--color-border-hover)]"
                    }`}>
                    <div className="text-xl mb-1.5">{opt.emoji}</div>
                    <p className="text-[13px] font-semibold">{opt.label}</p>
                    <p className="text-[10px] text-[var(--color-muted-foreground)] mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

          </motion.div>
        )}

        {/* ═══ SECURITY TAB ═══ */}
        {activeTab === "security" && (
          <motion.div key="security" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }} className="space-y-5">

            {/* ─── Change Password ─── */}
            <div className="glass-card p-6 rounded-2xl">
              <h2 className="font-bold text-[15px] flex items-center gap-2.5 mb-2">
                <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <KeyRound className="w-4 h-4 text-orange-400" />
                </div>
                Change Password
              </h2>
              <p className="text-[12px] text-[var(--color-muted-foreground)] mb-5 ml-[38px]">
                Update your password regularly to keep your account secure.
              </p>

              <div className="space-y-4 max-w-md">
                {/* Current Password */}
                <div>
                  <label className="block text-[12px] text-[var(--color-muted-foreground)] mb-1.5 font-medium flex items-center gap-1.5">
                    <Lock className="w-3 h-3 text-orange-400" /> Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPw ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      autoComplete="off" data-lpignore="true"
                      className="w-full px-4 pr-12 input-premium"
                      placeholder="Enter current password"
                    />
                    <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors">
                      {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-[12px] text-[var(--color-muted-foreground)] mb-1.5 font-medium flex items-center gap-1.5">
                    <Lock className="w-3 h-3 text-orange-400" /> New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPw ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); setPwError("") }}
                      autoComplete="new-password" data-lpignore="true"
                      className="w-full px-4 pr-12 input-premium"
                      placeholder="Enter new password"
                    />
                    <button type="button" onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors">
                      {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Password strength bar */}
                  {newPassword && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                            style={{ background: i <= pwStrength.score ? pwStrength.color : "var(--color-border)" }} />
                        ))}
                      </div>
                      <p className="text-[10px] font-semibold" style={{ color: pwStrength.color }}>{pwStrength.label}</p>
                    </div>
                  )}
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-[12px] text-[var(--color-muted-foreground)] mb-1.5 font-medium flex items-center gap-1.5">
                    <Lock className="w-3 h-3 text-orange-400" /> Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPw ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setPwError("") }}
                      autoComplete="new-password" data-lpignore="true"
                      className={`w-full px-4 pr-12 input-premium ${confirmPassword && confirmPassword !== newPassword ? "!border-red-500/50" : ""} ${confirmPassword && confirmPassword === newPassword ? "!border-green-500/50" : ""}`}
                      placeholder="Repeat new password"
                    />
                    <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors">
                      {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword === newPassword && (
                    <p className="text-[10px] text-green-400 mt-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Passwords match</p>
                  )}
                  {confirmPassword && confirmPassword !== newPassword && (
                    <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Passwords don&apos;t match</p>
                  )}
                </div>

                {/* Password requirements */}
                <div className="p-3 bg-[var(--color-secondary)] rounded-xl">
                  <p className="text-[11px] font-semibold text-[var(--color-muted-foreground)] mb-2">Password Requirements</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { label: "At least 8 characters", ok: newPassword.length >= 8 },
                      { label: "One uppercase letter", ok: /[A-Z]/.test(newPassword) },
                      { label: "One number", ok: /[0-9]/.test(newPassword) },
                      { label: "One special character", ok: /[^A-Za-z0-9]/.test(newPassword) },
                    ].map((req, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <div className={`w-3 h-3 rounded-full flex items-center justify-center ${req.ok ? "bg-green-500/20" : "bg-[var(--color-border)]"}`}>
                          {req.ok && <Check className="w-2 h-2 text-green-400" />}
                        </div>
                        <span className={`text-[10px] ${req.ok ? "text-green-400" : "text-[var(--color-muted-foreground)]"}`}>{req.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {pwError && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                    className="text-[12px] text-red-400 flex items-center gap-1.5 p-3 bg-red-500/5 border border-red-500/15 rounded-xl">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {pwError}
                  </motion.p>
                )}

                {pwSuccess && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                    className="text-[12px] text-green-400 flex items-center gap-1.5 p-3 bg-green-500/5 border border-green-500/15 rounded-xl">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Password changed successfully!
                  </motion.p>
                )}

                <button onClick={handleChangePassword}
                  className="btn-primary px-6 py-2.5 rounded-xl text-[13px] font-semibold flex items-center gap-2">
                  <KeyRound className="w-4 h-4" /> Update Password
                </button>
              </div>
            </div>

            {/* ─── Two-Factor Authentication ─── */}
            <div className="glass-card p-6 rounded-2xl">
              <h2 className="font-bold text-[15px] flex items-center gap-2.5 mb-2">
                <div className="w-7 h-7 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-green-400" />
                </div>
                Two-Factor Authentication
                {twoFactorEnabled && (
                  <span className="ml-auto px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-500/15 text-green-400 border border-green-500/20">ENABLED</span>
                )}
              </h2>
              <p className="text-[12px] text-[var(--color-muted-foreground)] mb-5 ml-[38px]">
                Add an extra layer of security using an authenticator app (Google Authenticator, Authy, etc.)
              </p>

              {!twoFactorEnabled && !show2FASetup && (
                <button onClick={handleEnable2FA}
                  className="btn-primary px-5 py-2.5 rounded-xl text-[13px] font-semibold flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Enable 2FA
                </button>
              )}

              {twoFactorEnabled && !show2FASetup && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 bg-green-500/5 border border-green-500/15 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                    <div>
                      <p className="text-[13px] font-semibold text-green-400">Two-factor authentication is active</p>
                      <p className="text-[11px] text-[var(--color-muted-foreground)]">Your account is protected with TOTP authentication.</p>
                    </div>
                  </div>
                  <button onClick={handleDisable2FA} className="text-[12px] text-red-400 hover:text-red-300 font-medium transition-colors">Disable 2FA</button>
                </div>
              )}

              {/* 2FA Setup Flow */}
              <AnimatePresence>
                {show2FASetup && !twoFactorEnabled && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="space-y-5 border border-[var(--color-border)] rounded-xl p-5 bg-[var(--color-secondary)]/50">
                      {/* Step 1: Scan QR */}
                      <div>
                        <p className="text-[13px] font-semibold mb-1 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-orange-500/15 text-orange-400 text-[10px] flex items-center justify-center font-bold">1</span>
                          Scan this QR code with your authenticator app
                        </p>
                        <p className="text-[11px] text-[var(--color-muted-foreground)] mb-3 ml-7">
                          Use Google Authenticator, Authy, or any TOTP-compatible app
                        </p>
                        <div className="flex flex-col sm:flex-row items-start gap-5 ml-7">
                          {/* Real QR code from API */}
                          <div className="w-[180px] h-[180px] bg-white rounded-xl p-1 flex items-center justify-center shadow-lg border border-[var(--color-border)]">
                            {qrCodeUrl ? (
                              <img src={qrCodeUrl} alt="Scan this QR code with your authenticator app" className="w-full h-full rounded" crossOrigin="anonymous" />
                            ) : (
                              <div className="animate-pulse w-full h-full bg-gray-200 rounded" />
                            )}
                          </div>
                          <div className="space-y-3 flex-1">
                            <p className="text-[11px] text-[var(--color-muted-foreground)]">Can&apos;t scan? Enter this key manually:</p>
                            <div className="flex items-center gap-2">
                              <code className="text-sm font-mono bg-[var(--color-card)] px-3 py-2 rounded-lg border border-[var(--color-border)] tracking-wider text-orange-400 select-all">
                                {formatSecret(twoFASecret)}
                              </code>
                              <button onClick={handleCopySecret}
                                className="p-2 rounded-lg hover:bg-[var(--color-secondary)] transition-colors" title="Copy secret">
                                {secretCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-[var(--color-muted-foreground)]" />}
                              </button>
                            </div>
                            <div className="p-2.5 bg-blue-500/5 border border-blue-500/15 rounded-lg">
                              <p className="text-[10px] text-blue-400">
                                <strong>Tip:</strong> This QR code is scannable with any TOTP authenticator app. The secret key is valid in Base32 format.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Step 2: Enter code */}
                      <div>
                        <p className="text-[13px] font-semibold mb-1 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-orange-500/15 text-orange-400 text-[10px] flex items-center justify-center font-bold">2</span>
                          Enter the 6-digit code from your app
                        </p>
                        <div className="flex gap-2 ml-7 mt-2">
                          <input type="text" value={twoFACode}
                            onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            maxLength={6} className="w-48 input-premium text-center tracking-[0.5em] text-lg font-mono" placeholder="000000" />
                          <button onClick={handleVerify2FA} className="btn-primary px-5 py-2 rounded-xl text-[13px] font-semibold">Verify</button>
                        </div>
                        {twoFAError && (
                          <p className="text-[11px] text-red-400 ml-7 mt-2 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {twoFAError}</p>
                        )}
                        {twoFASuccess && (
                          <p className="text-[11px] text-green-400 ml-7 mt-2 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> 2FA enabled successfully!</p>
                        )}
                      </div>

                      <button onClick={() => setShow2FASetup(false)}
                        className="text-[12px] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors ml-7">
                        Cancel setup
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Active Sessions */}
            <div className="glass-card p-6 rounded-2xl">
              <h2 className="font-bold text-[15px] flex items-center gap-2.5 mb-5">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center"><Smartphone className="w-4 h-4 text-blue-400" /></div>
                Active Sessions
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 bg-[var(--color-secondary)] rounded-xl border border-green-500/10">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <div>
                      <p className="text-[13px] font-semibold">Current Session</p>
                      <p className="text-[11px] text-[var(--color-muted-foreground)]">Windows · Chrome · This device</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-green-400 font-semibold">ACTIVE NOW</span>
                </div>
                <div className="flex items-center justify-between p-3.5 bg-[var(--color-secondary)] rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[var(--color-muted-foreground)]" />
                    <div>
                      <p className="text-[13px] font-semibold">Mobile App</p>
                      <p className="text-[11px] text-[var(--color-muted-foreground)]">iPhone 15 · Safari · Last active 2h ago</p>
                    </div>
                  </div>
                  <button className="text-[11px] text-red-400 hover:text-red-300 font-medium">Revoke</button>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="glass-card p-6 rounded-2xl border-red-500/10">
              <h2 className="font-bold text-[15px] flex items-center gap-2.5 mb-3 text-red-400">
                <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center"><Trash2 className="w-4 h-4 text-red-400" /></div>
                Danger Zone
              </h2>
              <p className="text-[13px] text-[var(--color-muted-foreground)] mb-4">Permanently delete all data including expenses, budgets, goals and settings.</p>
              <button onClick={handleClearData}
                className="px-5 py-2.5 bg-red-500/5 border border-red-500/20 text-red-400 hover:bg-red-500/10 rounded-xl text-[13px] font-semibold transition-all">
                Delete All Data
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Button */}
      <motion.div variants={fadeUp} className="sticky bottom-6 z-10">
        <div className="flex items-center gap-3">
          <button onClick={handleSave}
            className="btn-primary px-8 py-3 rounded-xl font-semibold text-[13px] flex items-center gap-2 shadow-lg shadow-orange-500/20">
            {saved ? <><Check className="w-4 h-4" /> Saved!</> : "Save Changes"}
          </button>
          {saved && (
            <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="text-[12px] text-green-400 font-medium">
              All changes saved successfully
            </motion.span>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
