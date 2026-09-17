'use client'

import { useEmailCapture } from '@/hooks/useEmailCapture'

export function EmailCapture() {
  const { email, setEmail, status, submit } = useEmailCapture()

  if (status === 'success') {
    return (
      <p className="text-sm font-medium text-success">
        Te-am notat — te anunțăm la fiecare noutate ✓
      </p>
    )
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="email@exemplu.com"
        className="min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 py-2 text-sm text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-2 ring-ring"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover transition-colors disabled:opacity-60 whitespace-nowrap"
      >
        {status === 'loading' ? '...' : 'Notifică-mă'}
      </button>
    </form>
  )
}
