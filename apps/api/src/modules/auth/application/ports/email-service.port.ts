export interface IEmailService {
  sendPasswordResetEmail(to: string, resetUrl: string): Promise<void>
  sendEmailVerificationEmail(to: string, verifyUrl: string): Promise<void>
}
