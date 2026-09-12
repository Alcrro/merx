import type { LoginResponse, SignupResponse, RefreshResponse, MeResponse } from '@merx/types'
import { apiClient } from './client'

export const authApi = {
  signup: (data: { email: string; password: string }) =>
    apiClient.post<SignupResponse>('/auth/signup', data).then((r) => r.data),

  login: (data: { email: string; password: string }) =>
    apiClient.post<LoginResponse>('/auth/login', data).then((r) => r.data),

  refresh: (data: { refreshToken: string; slug: string }) =>
    apiClient.post<RefreshResponse>('/auth/refresh', data).then((r) => r.data),

  logout: (refreshToken: string) => apiClient.post('/auth/logout', { refreshToken }),

  me: () => apiClient.get<MeResponse>('/auth/me').then((r) => r.data),

  ssoExchange: (data: { code: string }) =>
    apiClient.post<LoginResponse>('/auth/sso/exchange', data).then((r) => r.data),

  forgotPassword: (data: { email: string }) =>
    apiClient.post('/auth/forgot-password', data),

  resetPassword: (data: { token: string; password: string }) =>
    apiClient.post('/auth/reset-password', data),
}
