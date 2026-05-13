export default function VagaCardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card p-4 sm:p-5" style={{ opacity: 1 - i * 0.1 }}>
          <div className="flex items-start gap-3">
            {/* Logo skeleton */}
            <div className="skeleton w-10 h-10 rounded-lg flex-shrink-0" />

            <div className="flex-1 space-y-2.5">
              {/* Title skeleton */}
              <div className="skeleton h-4 w-3/4 rounded" />

              {/* Company skeleton */}
              <div className="skeleton h-3 w-1/3 rounded" />

              {/* Meta skeleton */}
              <div className="flex gap-2 mt-1">
                <div className="skeleton h-5 w-16 rounded-full" />
                <div className="skeleton h-3 w-12 rounded" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
