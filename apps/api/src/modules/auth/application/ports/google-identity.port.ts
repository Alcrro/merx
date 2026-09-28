export interface GoogleIdentity {
  googleId: string
  email: string
  emailVerified: boolean
  name: string | null
  avatarUrl: string | null
}

export interface IGoogleIdentityProvider {
  /** Exchanges an OAuth authorization code and returns the verified ID token claims. */
  exchangeCode(code: string): Promise<GoogleIdentity>
}
