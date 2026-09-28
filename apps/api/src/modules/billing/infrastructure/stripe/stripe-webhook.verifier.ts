import type Stripe from 'stripe'
import { stripe } from '../../../../lib/stripe'
import { BillingError } from '../../domain/errors'
import type { IBillingWebhookVerifier } from '../../domain/ports/billing-webhook-verifier.port'
import type { BillingWebhookEvent } from '../../domain/types'

// checkout.session.completed is deliberately not handled: subscription.created covers it
// (stripeCustomerId is persisted before checkout), and it would overlap with the storefront webhook.
const HANDLED_EVENTS = new Set<string>([
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
])

export class StripeWebhookVerifier implements IBillingWebhookVerifier {
  constructor(private readonly secret: string) {}

  verify(payload: Buffer, signature: string): BillingWebhookEvent | null {
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(payload, signature, this.secret)
    } catch {
      throw BillingError.invalidWebhook()
    }

    if (!HANDLED_EVENTS.has(event.type)) return null

    const subscription = event.data.object as Stripe.Subscription
    return { eventId: event.id, eventType: event.type, subscriptionId: subscription.id }
  }
}
