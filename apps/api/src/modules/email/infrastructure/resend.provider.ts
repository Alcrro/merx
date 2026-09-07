import { Resend } from 'resend'
import type { IEmailProvider, SendEmailPayload } from '../domain/email-provider.port'

export class ResendProvider implements IEmailProvider {
  private client: Resend

  constructor(apiKey: string) {
    this.client = new Resend(apiKey)
  }

  async send(payload: SendEmailPayload): Promise<{ id: string }> {
    const { data, error } = await this.client.emails.send({
      from: payload.from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      ...(payload.replyTo ? { reply_to: payload.replyTo } : {}),
    })
    if (error) throw new Error(error.message)
    return { id: data!.id }
  }
}
