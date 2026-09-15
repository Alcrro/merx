export default function HomeLoading() {
  return (
    <div>
      {/* Hero skeleton */}
      <div className="min-h-[480px] bg-gray-100 animate-pulse" />

      {/* Featured products skeleton */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div className="h-7 w-40 rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-20 rounded bg-gray-200 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <div className="aspect-square rounded-lg bg-gray-100 animate-pulse" />
              <div className="h-4 w-3/4 rounded bg-gray-100 animate-pulse" />
              <div className="h-4 w-1/2 rounded bg-gray-100 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
