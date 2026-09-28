import type { AuthUser, GoogleSignInCandidate } from '../types'

export interface IUserRepository {
  findUserByEmail(email: string): Promise<(AuthUser & { password: string }) | null>
  findUserById(id: string): Promise<AuthUser | null>
  createUser(data: { email: string; password: string; name?: string }): Promise<AuthUser>
  findUserForGoogleSignIn(googleId: string, email: string): Promise<GoogleSignInCandidate | null>
  createGoogleUser(data: { email: string; googleId: string; name: string | null; avatarUrl: string | null }): Promise<AuthUser>
  linkGoogleAccount(userId: string, googleId: string, options: { clearPassword: boolean }): Promise<void>
  setSsoCode(userId: string, code: string, expiresAt: Date): Promise<void>
  /** Atomically validates and clears a single-use SSO code. Returns null if invalid, expired or already consumed. */
  consumeSsoCode(code: string): Promise<AuthUser | null>
  updateUserPassword(userId: string, passwordHash: string): Promise<void>
  updateEmailVerified(userId: string, verified: boolean): Promise<void>
}
