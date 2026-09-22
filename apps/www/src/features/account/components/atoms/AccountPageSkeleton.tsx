function SkeletonLine({ w = 'w-full', h = 'h-3' }: { w?: string; h?: string }) {
  return <span className={`block ${w} ${h} rounded-lg bg-line-strong`} />
}

function SkeletonCard({ rows = 3, footer = false }: { rows?: number; footer?: boolean }) {
  return (
    <div className="rounded-2xl border border-line bg-surface-elevated p-4 sm:p-6 space-y-4">
      <div className="space-y-2">
        <SkeletonLine w="w-36" h="h-4" />
        <SkeletonLine w="w-56" h="h-3" />
      </div>
      <div className="space-y-3 pt-2">
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonLine key={i} w={i % 2 === 0 ? 'w-full' : 'w-4/5'} />
        ))}
      </div>
      {footer && (
        <div className="pt-2 flex justify-end">
          <SkeletonLine w="w-28" h="h-9" />
        </div>
      )}
    </div>
  )
}

export function AccountPageSkeleton({ cards = 2 }: { cards?: number }) {
  return (
    <div className="animate-pulse space-y-6">
      <div className="space-y-2">
        <SkeletonLine w="w-40" h="h-6" />
        <SkeletonLine w="w-64" h="h-3" />
      </div>
      {Array.from({ length: cards }).map((_, i) => (
        <SkeletonCard key={i} rows={3 + i} footer={i === 0} />
      ))}
    </div>
  )
}

export function SubscriptionPageSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="space-y-2">
        <SkeletonLine w="w-40" h="h-6" />
        <SkeletonLine w="w-64" h="h-3" />
      </div>
      <SkeletonCard rows={3} />
      <div className="space-y-5">
        <SkeletonLine w="w-32" h="h-5" />
        <div className="grid gap-4 sm:grid-cols-3">
          <SkeletonCard rows={4} />
          <SkeletonCard rows={4} />
          <SkeletonCard rows={4} />
        </div>
      </div>
    </div>
  )
}

export function TwoColPageSkeleton({ rightWidth = 'lg:w-80' }: { rightWidth?: string }) {
  return (
    <div className="animate-pulse space-y-6">
      <div className="space-y-2">
        <SkeletonLine w="w-40" h="h-6" />
        <SkeletonLine w="w-64" h="h-3" />
      </div>
      <div className={`flex flex-col lg:flex-row gap-6 items-start`}>
        <div className="w-full lg:flex-1 lg:min-w-0">
          <SkeletonCard rows={4} footer />
        </div>
        <div className={`w-full ${rightWidth} lg:shrink-0`}>
          <SkeletonCard rows={3} />
        </div>
      </div>
    </div>
  )
}
