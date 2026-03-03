export function LoadingSkeleton({ height = 'h-6', width = 'w-full', className = '' }) {
  return (
    <div className={`${height} ${width} bg-[#1a1f2b] rounded animate-pulse ${className}`} />
  );
}

export function ChartSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center gap-4">
        <LoadingSkeleton height="h-10" width="w-48" />
        <LoadingSkeleton height="h-6" width="w-24" />
      </div>
      <LoadingSkeleton height="h-[400px]" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <LoadingSkeleton key={i} height="h-20" />
        ))}
      </div>
    </div>
  );
}

export function ScannerSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(10)].map((_, i) => (
        <LoadingSkeleton key={i} height="h-12" />
      ))}
    </div>
  );
}
