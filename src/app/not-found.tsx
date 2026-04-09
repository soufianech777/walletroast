"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Flame, Home, ArrowLeft, Search } from "lucide-react"
import { useState, useEffect } from "react"

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
}

export default function NotFound() {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }

  if (!mounted) return null

  return (
    <div
      className="min-h-screen bg-[#050507] text-white flex items-center justify-center relative overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Dynamic background glow following mouse */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-700"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}% ${mousePos.y}%, rgba(249, 115, 22, 0.08), transparent 50%)`,
        }}
      />

      {/* Ambient fire particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-0"
            style={{
              left: `${5 + (i * 4.7) % 90}%`,
              bottom: `${Math.random() * 30}%`,
              width: `${3 + (i % 4) * 2}px`,
              height: `${3 + (i % 4) * 2}px`,
              background: ["#f97316", "#ef4444", "#fbbf24", "#ec4899"][i % 4],
              animation: `particle-rise ${2.5 + (i % 5) * 0.5}s ${i * 0.3}s ease-in-out infinite`,
              filter: `blur(${i % 3}px)`,
              boxShadow: `0 0 ${4 + i % 6}px currentColor`,
            }}
          />
        ))}
      </div>

      {/* Floating 404 emojis */}
      <div className="absolute inset-0 pointer-events-none">
        {["🔥", "💀", "😵", "🕳️", "👻", "🫥"].map((emoji, i) => (
          <span
            key={i}
            className="absolute text-2xl sm:text-3xl opacity-0"
            style={{
              left: `${10 + i * 15}%`,
              bottom: "15%",
              animation: `emoji-float ${3.5 + i * 0.4}s ${i * 0.8}s ease-in-out infinite`,
              filter: "drop-shadow(0 0 8px rgba(249, 115, 22, 0.4))",
            }}
          >
            {emoji}
          </span>
        ))}
      </div>

      {/* Main content */}
      <motion.div
        className="relative z-10 text-center px-6 max-w-lg"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        {/* Animated 404 number */}
        <motion.div variants={fadeUp} className="mb-6">
          <div className="relative inline-block">
            <span className="text-[8rem] sm:text-[10rem] font-black leading-none tracking-tighter select-none"
              style={{
                background: "linear-gradient(135deg, #f97316 0%, #ef4444 40%, #ec4899 70%, #f97316 100%)",
                backgroundSize: "200% 200%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "mega-cta-gradient 3s ease-in-out infinite",
                filter: "drop-shadow(0 0 40px rgba(249, 115, 22, 0.3))",
              }}
            >
              404
            </span>
            {/* Fire emoji on top */}
            <motion.span
              className="absolute -top-4 sm:-top-6 left-1/2 -translate-x-1/2 text-4xl sm:text-5xl"
              animate={{
                scale: [1, 1.15, 1, 1.08, 1],
                rotate: [0, 5, -5, 3, 0],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              🔥
            </motion.span>
          </div>
        </motion.div>

        {/* Message */}
        <motion.div variants={fadeUp}>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-3">
            Page Got <span className="gradient-text-fire">Roasted</span>
          </h1>
          <p className="text-[14px] sm:text-[15px] text-zinc-400 leading-relaxed max-w-sm mx-auto mb-8">
            This page doesn&apos;t exist — looks like it burned to ashes.
            Maybe your budget discipline was so bad, this page couldn&apos;t handle it.
          </p>
        </motion.div>

        {/* Action buttons */}
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-[14px] text-white transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, #f97316, #ea580c)",
              boxShadow: "0 4px 20px rgba(249, 115, 22, 0.35)",
            }}
          >
            <Home className="w-4.5 h-4.5" />
            Back to Home
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-[14px] text-zinc-300 border border-zinc-700/80 hover:border-orange-500/30 hover:text-white transition-all duration-300 bg-zinc-900/50 backdrop-blur-sm"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
            Dashboard
          </Link>
        </motion.div>

        {/* Fun roast message */}
        <motion.div variants={fadeUp} className="mt-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/80 border border-zinc-800 text-[12px] text-zinc-500">
            <Flame className="w-3.5 h-3.5 text-orange-500/60" />
            <span>Error 404 — Even your pages are disappearing like your savings</span>
            <Flame className="w-3.5 h-3.5 text-orange-500/60" />
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
