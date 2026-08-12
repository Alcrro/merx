import type { AuthResponse, AuthUser, AuthStore } from '@merx/types'
import { apiClient } from './index'

export const authApi = {
  signup: (data: { email: string; password: string; name?: string }) =>
    apiClient.post<AuthResponse>('/auth/signup', data).then((r) => r.data),

  login: (data: { email: string; password: string }) =>
    apiClient.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  refresh: (refreshToken: string) =>
    apiClient
      .post<{ accessToken: string; refreshToken: string }>('/auth/refresh', { refreshToken })
      .then((r) => r.data),

  logout: (refreshToken: string) => apiClient.post('/auth/logout', { refreshToken }),

  me: () =>
    apiClient.get<{ user: AuthUser; store: AuthStore }>('/auth/me').then((r) => r.data),
}
