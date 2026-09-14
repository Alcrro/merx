export interface EmailVerificationRecord {
  id: string
  userId: string
  expiresAt: Date
  usedAt: Date | null
}

export interface IEmailVerificationRepository {
  createEmailVerificationToken(data: { userId: string; tokenHash: string; expiresAt: Date }): Promise<void>
  findEmailVerificationToken(tokenHash: string): Promise<EmailVerificationRecord | null>
  markEmailVerificationTokenUsed(id: string): Promise<void>
  deleteEmailVerificationTokens(userId: string): Promise<void>
}
