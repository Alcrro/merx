import { AppError } from './app.error'
import { ErrorCode } from './codes'

export class UnauthorizedError extends AppError {
  constructor() {
    super(
      'Unauthorized',
      'Nu ești autorizat să efectuezi această acțiune.',
      ErrorCode.UNAUTHORIZED,
      401,
    )
    this.name = 'UnauthorizedError'
  }
}
