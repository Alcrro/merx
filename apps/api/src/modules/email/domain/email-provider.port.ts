export interface SendEmailPayload {
  from: string
  to: string
  subject: string
  html: string
  replyTo?: string
}

export interface IEmailProvider {
  send(payload: SendEmailPayload): Promise<{ id: string }>
}
