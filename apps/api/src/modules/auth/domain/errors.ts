import { DomainError } from '../../../lib/domain-error'

export class AuthError extends DomainError {
  declare readonly code: 'NOT_FOUND' | 'CONFLICT' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'TOKEN_REUSE' | 'INVALID_TOKEN'

  static unauthorized(message = 'Invalid credentials'): AuthError {
    return new AuthError(message, 'UNAUTHORIZED')
  }

  static forbidden(message = 'Access denied'): AuthError {
    return new AuthError(message, 'FORBIDDEN')
  }

  static tokenReuse(): AuthError {
    return new AuthError('Token reuse detected', 'TOKEN_REUSE')
  }

  static invalidToken(message = 'Invalid or expired token'): AuthError {
    return new AuthError(message, 'INVALID_TOKEN')
  }
}
