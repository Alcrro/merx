export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={[
        'animate-spin rounded-full border-2 border-indigo-600 border-t-transparent',
        className ?? 'h-8 w-8',
      ].join(' ')}
    />
  )
}
