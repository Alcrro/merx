import { DomainError } from '../../../lib/domain-error'

export class OrderError extends DomainError {
  declare readonly code: 'NOT_FOUND' | 'CONFLICT' | 'INVALID' | 'FORBIDDEN' | 'STRIPE_ERROR'

  static invalid(message: string): OrderError {
    return new OrderError(message, 'INVALID')
  }

  static stripeError(message: string): OrderError {
    return new OrderError(message, 'STRIPE_ERROR')
  }
}
