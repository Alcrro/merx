import { DomainError } from '../../../lib/domain-error'

export class BillingError extends DomainError {
  declare readonly code: 'NOT_FOUND' | 'CONFLICT' | 'INVALID_PLAN' | 'INVALID_WEBHOOK'

  static invalidPlan(message = 'Invalid plan'): BillingError {
    return new BillingError(message, 'INVALID_PLAN')
  }

  static invalidWebhook(message = 'Invalid webhook signature'): BillingError {
    return new BillingError(message, 'INVALID_WEBHOOK')
  }
}
