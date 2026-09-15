export default function ProductsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="h-9 w-56 rounded bg-gray-200 animate-pulse mb-8" />

      {/* Category filter skeleton */}
      <div className="flex gap-2 mb-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 w-24 rounded-full bg-gray-100 animate-pulse" />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <div className="aspect-square rounded-lg bg-gray-100 animate-pulse" />
            <div className="h-4 w-3/4 rounded bg-gray-100 animate-pulse" />
            <div className="h-4 w-1/2 rounded bg-gray-100 animate-pulse" />
            <div className="h-8 w-full rounded bg-gray-100 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
