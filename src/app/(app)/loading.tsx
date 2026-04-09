export default function AppLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-3 w-20 bg-[var(--color-secondary)] rounded-lg mb-2" />
          <div className="h-7 w-48 bg-[var(--color-secondary)] rounded-xl" />
        </div>
        <div className="h-10 w-28 bg-[var(--color-secondary)] rounded-xl" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="glass-card rounded-xl p-5">
            <div className="h-3 w-16 bg-[var(--color-secondary)] rounded mb-3 mx-auto" />
            <div className="h-6 w-12 bg-[var(--color-secondary)] rounded-lg mx-auto" />
          </div>
        ))}
      </div>

      {/* Main content skeleton */}
      <div className="glass-card rounded-2xl p-6">
        <div className="h-4 w-32 bg-[var(--color-secondary)] rounded-lg mb-4" />
        <div className="h-48 bg-[var(--color-secondary)] rounded-xl" />
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2].map(i => (
          <div key={i} className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[var(--color-secondary)] rounded-xl" />
              <div className="flex-1">
                <div className="h-3.5 w-24 bg-[var(--color-secondary)] rounded-lg mb-2" />
                <div className="h-2.5 w-16 bg-[var(--color-secondary)] rounded" />
              </div>
            </div>
            <div className="h-20 bg-[var(--color-secondary)] rounded-xl" />
          </div>
        ))}
      </div>

      {/* Shimmer overlay */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-pulse > div,
        .animate-pulse > div > div {
          position: relative;
          overflow: hidden;
        }
        .animate-pulse > div::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(249, 115, 22, 0.03), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
