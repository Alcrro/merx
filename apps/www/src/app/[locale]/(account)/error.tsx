'use client'

import { useEffect } from 'react'
import Link from 'next/link'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function AccountError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[account-error]', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <p className="text-4xl font-extrabold text-fg">Ceva a mers prost</p>
      <p className="mt-3 text-sm text-fg-muted max-w-sm">
        A apărut o eroare neașteptată. Încearcă din nou sau revino mai târziu.
      </p>
      {error.digest && (
        <p className="mt-2 text-xs text-fg-subtle font-mono">ID: {error.digest}</p>
      )}
      <div className="mt-8 flex items-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
        >
          Încearcă din nou
        </button>
        <Link
          href="/account"
          className="inline-flex items-center justify-center rounded-xl border border-line px-5 py-2.5 text-sm font-semibold text-fg hover:bg-surface-subtle transition-colors"
        >
          Înapoi la cont
        </Link>
      </div>
    </div>
  )
}
