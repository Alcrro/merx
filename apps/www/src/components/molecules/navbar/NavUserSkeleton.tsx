export function NavUserSkeleton() {
  return (
    <div className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 animate-pulse">
      <span className="w-7 h-7 rounded-full bg-surface-subtle shrink-0" />
      <span className="hidden lg:block h-3.5 w-20 rounded bg-surface-subtle" />
      <span className="w-3.5 h-3.5 rounded bg-surface-subtle" />
    </div>
  )
}
