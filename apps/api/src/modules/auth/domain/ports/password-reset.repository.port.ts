export interface PasswordResetRecord {
  id: string
  userId: string
  expiresAt: Date
  usedAt: Date | null
}

export interface IPasswordResetRepository {
  createPasswordResetToken(data: { userId: string; tokenHash: string; expiresAt: Date }): Promise<void>
  findPasswordResetToken(tokenHash: string): Promise<PasswordResetRecord | null>
  markPasswordResetTokenUsed(id: string): Promise<void>
  deleteExpiredPasswordResetTokens(userId: string): Promise<void>
}
