import type { BillingWebhookEvent } from '../types'

export interface IBillingWebhookVerifier {
  /**
   * Verifies the provider signature and normalizes the event.
   * Throws BillingError INVALID_WEBHOOK on a bad signature; returns null for event types billing does not handle.
   */
  verify(payload: Buffer, signature: string): BillingWebhookEvent | null
}
