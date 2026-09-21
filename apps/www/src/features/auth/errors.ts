import { AppError } from '@/errors/app.error'
import { ErrorCode } from '@/errors/codes'

export class AuthError extends AppError {
  constructor(message: string, userMessage: string, code: ErrorCode, statusCode: number) {
    super(message, userMessage, code, statusCode)
    this.name = 'AuthError'
  }
}

export class AuthValidationError extends AuthError {
  constructor(messageKey: string) {
    super(`Auth validation: ${messageKey}`, messageKey, ErrorCode.AUTH_VALIDATION, 422)
    this.name = 'AuthValidationError'
  }
}

export class InvalidCredentialsError extends AuthError {
  constructor() {
    super('Invalid credentials', 'invalidCredentials', ErrorCode.AUTH_INVALID_CREDENTIALS, 401)
    this.name = 'InvalidCredentialsError'
  }
}

export class EmailExistsError extends AuthError {
  constructor() {
    super('Email already exists', 'emailExists', ErrorCode.AUTH_EMAIL_EXISTS, 409)
    this.name = 'EmailExistsError'
  }
}

export class InvalidTokenError extends AuthError {
  constructor() {
    super('Invalid or expired token', 'invalidToken', ErrorCode.AUTH_INVALID_TOKEN, 400)
    this.name = 'InvalidTokenError'
  }
}

export class AuthServerError extends AuthError {
  constructor() {
    super('Auth server error', 'serverError', ErrorCode.AUTH_SERVER_ERROR, 500)
    this.name = 'AuthServerError'
  }
}
