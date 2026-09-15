export default function ProductDetailLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="h-4 w-32 rounded bg-gray-200 animate-pulse mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image skeleton */}
        <div className="aspect-square rounded-lg bg-gray-100 animate-pulse" />

        {/* Details skeleton */}
        <div className="flex flex-col gap-4 pt-2">
          <div className="h-8 w-3/4 rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-1/3 rounded bg-gray-100 animate-pulse" />
          <div className="h-6 w-24 rounded bg-gray-200 animate-pulse mt-2" />

          <div className="flex flex-col gap-2 mt-4">
            <div className="h-4 w-full rounded bg-gray-100 animate-pulse" />
            <div className="h-4 w-5/6 rounded bg-gray-100 animate-pulse" />
            <div className="h-4 w-4/6 rounded bg-gray-100 animate-pulse" />
          </div>

          <div className="flex gap-2 mt-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 w-20 rounded bg-gray-100 animate-pulse" />
            ))}
          </div>

          <div className="h-11 w-full rounded bg-gray-200 animate-pulse mt-4" />
        </div>
      </div>
    </div>
  )
}
