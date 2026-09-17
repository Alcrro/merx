import { AppError } from '@/errors/app.error'
import { ErrorCode } from '@/errors/codes'

export class ContactError extends AppError {
  constructor(message: string, userMessage: string, code: ErrorCode, statusCode: number) {
    super(message, userMessage, code, statusCode)
    this.name = 'ContactError'
  }
}

export class ValidationError extends ContactError {
  constructor(message: string) {
    super(`Validation failed: ${message}`, message, ErrorCode.CONTACT_VALIDATION, 422)
    this.name = 'ValidationError'
  }
}

export class MailerError extends ContactError {
  constructor(cause?: unknown) {
    super(
      'Failed to send email',
      'A apărut o eroare. Încearcă din nou sau scrie direct la hello@merx.com.',
      ErrorCode.CONTACT_MAILER,
      500,
    )
    this.name = 'MailerError'
    this.cause = cause
  }
}
