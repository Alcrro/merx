import { Resend } from 'resend'
import { MailerError } from '../errors'
import { config } from '@/config'

const resend = new Resend(config.email.apiKey)

interface SendContactEmailParams {
  name: string
  email: string
  topic: string
  body: string
  toEmail: string
}

export async function sendEmail({ name, email, topic, body, toEmail }: SendContactEmailParams): Promise<void> {
  const { error } = await resend.emails.send({
    from: 'noreply@merx.com',
    to: toEmail,
    replyTo: email,
    subject: `[Contact] ${topic} — ${name}`,
    text: `Nume: ${name}\nEmail: ${email}\nSubiect: ${topic}\n\n${body}`,
  })

  if (error) {
    console.error('[contact] resend error', error)
    throw new MailerError(error)
  }
}
