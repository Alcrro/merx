'use client'

import { useEffect } from 'react'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('[global-error]', error)
  }, [error])

  return (
    <html lang="ro">
      <body className="bg-white text-gray-900 font-sans antialiased">
        <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
          <p className="text-8xl font-extrabold tracking-tight">500</p>
          <p className="mt-4 text-xl font-semibold">Eroare de server</p>
          <p className="mt-2 text-sm text-gray-500 max-w-sm">
            A apărut o eroare neașteptată. Echipa a fost notificată.
          </p>
          {error.digest && (
            <p className="mt-2 text-xs text-gray-400 font-mono">ID: {error.digest}</p>
          )}
          <button
            onClick={reset}
            className="mt-8 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
          >
            Încearcă din nou
          </button>
        </div>
      </body>
    </html>
  )
}
