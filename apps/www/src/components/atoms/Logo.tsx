import Link from 'next/link'

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 select-none group">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 group-hover:bg-indigo-700 transition-colors">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M3 12V5l5-3 5 3v7l-5 3-5-3Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M8 2v12M3 5l5 3 5-3" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      </div>
      <span className="text-lg font-bold tracking-tight text-fg">Merx</span>
    </Link>
  )
}
