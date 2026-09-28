export type StoreStatus = 'active' | 'suspended' | 'blocked'

export interface AuthUser {
  id: string
  email: string
  name: string | null
  platformRole: 'admin' | 'user'
  emailVerified: boolean
  createdAt: Date
}

/** Existing account matched during Google sign-in (by googleId first, then email). */
export interface GoogleSignInCandidate extends AuthUser {
  googleId: string | null
  hasPassword: boolean
  deleted: boolean
}

export interface AuthStore {
  id: string
  name: string
  slug: string
  currency: string
}

export interface AuthStoreWithMeta extends AuthStore {
  ownerId: string
  status: StoreStatus
}

export interface PlatformTokenPayload {
  sub: string
  type: 'platform'
}

export interface StoreTokenPayload {
  sub: string
  storeId: string
  type: 'store'
}

export type TokenPayload = PlatformTokenPayload | StoreTokenPayload

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}
