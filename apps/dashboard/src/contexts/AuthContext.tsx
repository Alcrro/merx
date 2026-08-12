import { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { isAxiosError } from 'axios'
import { apiClient, authApi } from '@merx/api-client'
import type { AuthUser, AuthStore } from '@merx/types'
import { tokens } from '../lib/tokens'

interface AuthState {
  user: AuthUser | null
  store: AuthStore | null
  isLoading: boolean
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name?: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, store: null, isLoading: true })
  const interceptorRef = useRef<number | null>(null)

  const setAuthed = (user: AuthUser, store: AuthStore) =>
    setState({ user, store, isLoading: false })

  const setUnauthed = () => setState({ user: null, store: null, isLoading: false })

  useEffect(() => {
    const controller = new AbortController()

    // 401 interceptor — auto-refresh then retry
    interceptorRef.current = apiClient.interceptors.response.use(
      (res) => res,
      async (error: unknown) => {
        if (!isAxiosError(error) || !error.config) {
          return Promise.reject(error instanceof Error ? error : new Error(String(error)))
        }
        const original = error.config
        if (
          error.response?.status !== 401 ||
          original._retry ||
          original.url?.includes('/auth/')
        ) {
          return Promise.reject(error)
        }
        original._retry = true

        const refreshToken = tokens.getRefresh()
        if (!refreshToken) {
          if (!controller.signal.aborted) { setUnauthed(); tokens.clear() }
          return Promise.reject(error)
        }

        try {
          const data = await authApi.refresh(refreshToken)
          tokens.set(data.accessToken, data.refreshToken)
          original.headers.set('Authorization', `Bearer ${data.accessToken}`)
          return await apiClient(original)
        } catch {
          if (!controller.signal.aborted) { setUnauthed(); tokens.clear() }
          return Promise.reject(error)
        }
      }
    )

    // Restore session
    const access = tokens.getAccess()
    if (!access) {
      setUnauthed()
    } else {
      authApi
        .me()
        .then(({ user, store }) => {
          if (!controller.signal.aborted) setAuthed(user, store)
        })
        .catch(() => {
          if (!controller.signal.aborted) { tokens.clear(); setUnauthed() }
        })
    }

    return () => {
      controller.abort()
      if (interceptorRef.current !== null) {
        apiClient.interceptors.response.eject(interceptorRef.current)
      }
    }
  }, [])

  const login = async (email: string, password: string) => {
    const data = await authApi.login({ email, password })
    tokens.set(data.accessToken, data.refreshToken)
    setAuthed(data.user, data.store)
  }

  const signup = async (email: string, password: string, name?: string) => {
    const data = await authApi.signup({ email, password, name })
    tokens.set(data.accessToken, data.refreshToken)
    setAuthed(data.user, data.store)
  }

  const logout = () => {
    const refresh = tokens.getRefresh()
    tokens.clear()
    setUnauthed()
    if (refresh) void authApi.logout(refresh).catch((_: unknown) => undefined)
  }

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    _retry?: boolean
  }
}
