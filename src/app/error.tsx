"use client"

import { motion } from "framer-motion"
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react"
import Link from "next/link"

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
}

const stagger = { visible: { transition: { staggerChildren: 0.08 } } }

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-[#050507] text-white flex items-center justify-center relative overflow-hidden">
      {/* Subtle danger glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-red-500/[0.04] blur-[100px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-t from-orange-500/[0.03] to-transparent" />
      </div>

      <motion.div
        className="relative z-10 text-center px-6 max-w-md"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        {/* Icon */}
        <motion.div variants={fadeUp} className="mb-6">
          <motion.div
            className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center relative"
            style={{
              background: "linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(249, 115, 22, 0.08))",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              boxShadow: "0 0 40px rgba(239, 68, 68, 0.1)",
            }}
            animate={{
              boxShadow: [
                "0 0 40px rgba(239, 68, 68, 0.1)",
                "0 0 60px rgba(239, 68, 68, 0.2)",
                "0 0 40px rgba(239, 68, 68, 0.1)",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <AlertTriangle className="w-9 h-9 text-red-400" />
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.div variants={fadeUp}>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
            Something <span className="text-red-400">Broke</span>
          </h1>
          <p className="text-[14px] text-zinc-400 leading-relaxed mb-8 max-w-sm mx-auto">
            An unexpected error occurred. Don&apos;t worry — your data is safe. 
            Try refreshing the page or go back to the dashboard.
          </p>
        </motion.div>

        {/* Error digest (dev only visual) */}
        {error?.digest && (
          <motion.div variants={fadeUp} className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800 text-[11px] text-zinc-500 font-mono">
              <Bug className="w-3 h-3" />
              Error ID: {error.digest}
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-[14px] text-white transition-all duration-300 hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg, #f97316, #ea580c)",
              boxShadow: "0 4px 20px rgba(249, 115, 22, 0.35)",
            }}
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-[14px] text-zinc-300 border border-zinc-700/80 hover:border-orange-500/30 hover:text-white transition-all duration-300 bg-zinc-900/50"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Link>
        </motion.div>

        {/* Footer message */}
        <motion.div variants={fadeUp} className="mt-10">
          <p className="text-[11px] text-zinc-600">
            If this keeps happening, try clearing your browser data or contact support.
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
