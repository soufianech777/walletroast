export default function RootLoading() {
  return (
    <div className="min-h-screen bg-[#050507] flex items-center justify-center">
      <div className="text-center">
        {/* Animated flame logo */}
        <div className="relative w-16 h-16 mx-auto mb-5">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(239, 68, 68, 0.08))",
              border: "1px solid rgba(249, 115, 22, 0.2)",
              animation: "pulse-glow 2s ease-in-out infinite",
            }}
          >
            <span className="text-3xl" style={{ animation: "heartbeat 1.5s ease-in-out infinite" }}>
              🔥
            </span>
          </div>
        </div>

        {/* Loading bar */}
        <div className="w-48 h-1 bg-zinc-900 rounded-full mx-auto overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(90deg, #f97316, #ef4444, #f97316)",
              backgroundSize: "200% 100%",
              animation: "shimmer-bar 1.5s ease-in-out infinite",
            }}
          />
        </div>

        <p className="text-[12px] text-zinc-600 mt-3 font-medium tracking-wide">Loading...</p>
      </div>

      <style>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(249, 115, 22, 0.1); }
          50% { box-shadow: 0 0 40px rgba(249, 115, 22, 0.25); }
        }
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          15% { transform: scale(1.2); }
          30% { transform: scale(1); }
          45% { transform: scale(1.1); }
          60% { transform: scale(1); }
        }
        @keyframes shimmer-bar {
          0% { width: 0%; background-position: 0% center; }
          50% { width: 70%; }
          100% { width: 100%; background-position: 200% center; }
        }
      `}</style>
    </div>
  )
}
