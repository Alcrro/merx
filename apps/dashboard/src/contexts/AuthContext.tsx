import { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { isAxiosError } from 'axios'
import { apiClient, authApi, introApi } from '@merx/api-client'
import type { AuthUser, AuthStore } from '@merx/types'
import { tokens } from '../lib/tokens'

interface AuthState {
  user: AuthUser | null
  store: AuthStore | null
  introCompleted: boolean | null
  isLoading: boolean
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string) => Promise<void>
  logout: () => void
  markIntroCompleted: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function fetchIntroCompleted(store: AuthStore | null): Promise<boolean | null> {
  if (!store) return null
  const { completed } = await introApi.getState()
  return completed
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, store: null, introCompleted: null, isLoading: true })
  const interceptorRef = useRef<number | null>(null)

  const setAuthed = (user: AuthUser, store: AuthStore | null, introCompleted: boolean | null) =>
    setState({ user, store, introCompleted, isLoading: false })

  const setUnauthed = () => setState({ user: null, store: null, introCompleted: null, isLoading: false })

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
        const slug = tokens.getSlug()
        if (!refreshToken || !slug) {
          if (!controller.signal.aborted) { setUnauthed(); tokens.clear() }
          return Promise.reject(error)
        }

        try {
          const data = await authApi.refresh({ refreshToken, slug })
          tokens.set(data.accessToken, data.refreshToken, slug)
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
    const refresh = tokens.getRefresh()
    const slug = tokens.getSlug()

    if (access) {
      authApi
        .me()
        .then(async ({ user, stores }) => {
          const store = slug ? (stores.find((s) => s.slug === slug) ?? stores[0] ?? null) : (stores[0] ?? null)
          const introCompleted = await fetchIntroCompleted(store).catch(() => null)
          if (!controller.signal.aborted) setAuthed(user, store, introCompleted)
        })
        .catch(() => {
          if (!controller.signal.aborted) { tokens.clear(); setUnauthed() }
        })
    } else if (refresh && slug) {
      authApi
        .refresh({ refreshToken: refresh, slug })
        .then(({ accessToken, refreshToken: newRefresh }) => {
          tokens.set(accessToken, newRefresh, slug)
          return authApi.me()
        })
        .then(async ({ user, stores }) => {
          const store = stores.find((s) => s.slug === slug) ?? stores[0] ?? null
          const introCompleted = await fetchIntroCompleted(store).catch(() => null)
          if (!controller.signal.aborted) setAuthed(user, store, introCompleted)
        })
        .catch(() => {
          if (!controller.signal.aborted) { tokens.clear(); setUnauthed() }
        })
    } else {
      setUnauthed()
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

    if (data.stores.length > 0) {
      const store = data.stores[0]
      const tokenData = await authApi.refresh({ refreshToken: data.refreshToken, slug: store.slug })
      tokens.set(tokenData.accessToken, tokenData.refreshToken, store.slug)
      const introCompleted = await fetchIntroCompleted(store).catch(() => null)
      setAuthed(data.user, store, introCompleted)
    } else {
      tokens.setRefresh(data.refreshToken)
      setAuthed(data.user, null, null)
    }
  }

  const signup = async (email: string, password: string) => {
    const data = await authApi.signup({ email, password })
    tokens.setRefresh(data.refreshToken)
    setAuthed(data.user, null, null)
  }

  const markIntroCompleted = () =>
    setState((prev) => ({ ...prev, introCompleted: true }))

  const logout = () => {
    const refresh = tokens.getRefresh()
    tokens.clear()
    setUnauthed()
    if (refresh) void authApi.logout(refresh).catch((_: unknown) => undefined)
  }

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout, markIntroCompleted }}>
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
