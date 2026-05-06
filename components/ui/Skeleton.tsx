export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-white/10 rounded-lg${className ? ` ${className}` : ""}`}
    />
  );
}

export function WeatherSkeleton() {
  return (
    <div className="w-full rounded-2xl bg-white/8 border border-white/10 overflow-hidden p-4 sm:p-6 space-y-4">
      <div className="flex justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-16 w-16 rounded-full" />
      </div>
      <Skeleton className="h-16 w-28" />
      <Skeleton className="h-4 w-40" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    </div>
  );
}
