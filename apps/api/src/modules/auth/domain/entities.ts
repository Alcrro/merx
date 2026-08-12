export interface AuthUser {
  id: string
  email: string
  name: string | null
  createdAt: Date
}

export interface AuthStore {
  id: string
  name: string
  slug: string
  currency: string
}

export interface AccessTokenPayload {
  sub: string
  storeId: string
  role: 'owner' | 'member'
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}
