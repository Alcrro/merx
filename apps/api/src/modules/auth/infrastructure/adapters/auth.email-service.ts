import type { IEmailProvider } from '../../../email/domain/email-provider.port'
import type { IEmailService } from '../../application/ports/email-service.port'
import { config } from '../../../../config'

export class AuthEmailService implements IEmailService {
  constructor(private readonly provider: IEmailProvider) {}

  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
    await this.provider.send({
      from: config.email.from,
      to,
      subject: 'Resetează parola Merx',
      html: `
        <p>Ai solicitat resetarea parolei pentru contul tău Merx.</p>
        <p><a href="${resetUrl}">Resetează parola</a></p>
        <p>Link-ul este valid 15 minute. Dacă nu ai solicitat resetarea, poți ignora acest email.</p>
      `,
    })
  }

  async sendEmailVerificationEmail(to: string, verifyUrl: string): Promise<void> {
    await this.provider.send({
      from: config.email.from,
      to,
      subject: 'Confirmă adresa de email Merx',
      html: `
        <p>Bun venit pe Merx! Confirmă adresa de email pentru a activa toate funcționalitățile.</p>
        <p><a href="${verifyUrl}">Confirmă adresa de email</a></p>
        <p>Link-ul este valid 24 de ore.</p>
      `,
    })
  }
}
