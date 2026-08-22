import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../../../hooks/useAuth'

export function IntroRoute({ children }: { children: ReactNode }) {
  const { user, introCompleted, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <svg className="h-6 w-6 animate-spin text-indigo-600" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  // Already completed or not applicable (no store) → dashboard
  if (introCompleted !== false) return <Navigate to="/dashboard" replace />

  return <>{children}</>
}
