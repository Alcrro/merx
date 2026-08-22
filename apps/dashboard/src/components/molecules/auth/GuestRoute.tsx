import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../../../hooks/useAuth'

export function GuestRoute({ children }: { children: ReactNode }) {
  const { user, store, isLoading } = useAuth()

  if (isLoading) return null

  if (user) return <Navigate to={store ? '/dashboard' : '/marketplace'} replace />

  return <>{children}</>
}
