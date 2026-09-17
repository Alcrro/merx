import { AppError } from './app.error'
import { ErrorCode } from './codes'

export class RateLimitError extends AppError {
  constructor() {
    super(
      'Rate limit exceeded',
      'Prea multe cereri. Încearcă din nou mai târziu sau scrie direct la hello@merx.com.',
      ErrorCode.RATE_LIMIT,
      429,
    )
    this.name = 'RateLimitError'
  }
}
