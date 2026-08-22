import { DomainError } from '../../../lib/domain-error'

export class AuthError extends DomainError {
  declare readonly code: 'NOT_FOUND' | 'CONFLICT' | 'UNAUTHORIZED' | 'TOKEN_REUSE'

  static unauthorized(message = 'Invalid credentials'): AuthError {
    return new AuthError(message, 'UNAUTHORIZED')
  }

  static tokenReuse(): AuthError {
    return new AuthError('Token reuse detected', 'TOKEN_REUSE')
  }
}
