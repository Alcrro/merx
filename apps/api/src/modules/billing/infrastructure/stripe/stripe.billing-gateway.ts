import type Stripe from 'stripe'
import { stripe } from '../../../../lib/stripe'
import type { IBillingGateway } from '../../domain/ports/billing-gateway.port'
import type {
  ActiveSubscription,
  BillingCard,
  BillingInvoice,
  CheckoutSessionParams,
  SubscriptionSnapshot,
  SubscriptionStatus,
} from '../../domain/types'

const KNOWN_STATUSES: ReadonlySet<string> = new Set<SubscriptionStatus>([
  'active',
  'trialing',
  'past_due',
  'unpaid',
  'canceled',
  'incomplete',
  'incomplete_expired',
  'paused',
])

export class StripeBillingGateway implements IBillingGateway {
  async createCustomer(input: { userId: string; email: string; name: string | null }): Promise<string> {
    // Idempotency key collapses concurrent get-or-create calls for the same user into one Stripe customer.
    const customer = await stripe.customers.create(
      {
        email: input.email,
        name: input.name ?? undefined,
        metadata: { merxUserId: input.userId },
      },
      { idempotencyKey: `merx-customer-${input.userId}` },
    )
    return customer.id
  }

  async getActiveSubscription(customerId: string): Promise<ActiveSubscription | null> {
    const subs = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
      expand: ['data.items.data.price'],
    })

    const sub = subs.data.at(0)
    if (!sub) return null

    const item = firstItem(sub)
    const price = item.price
    const productId = typeof price.product === 'string' ? price.product : price.product.id
    const product = await stripe.products.retrieve(productId)

    return {
      subscriptionId: sub.id,
      itemId: item.id,
      planName: product.name,
      priceId: price.id,
      priceAmount: price.unit_amount ?? 0,
      currency: price.currency,
      interval: price.recurring?.interval ?? 'month',
      startsAt: item.current_period_start,
      renewsAt: item.current_period_end,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    }
  }

  async getSubscriptionSnapshot(subscriptionId: string): Promise<SubscriptionSnapshot> {
    const sub = await stripe.subscriptions.retrieve(subscriptionId)

    return {
      subscriptionId: sub.id,
      customerId: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
      status: toSubscriptionStatus(sub.status),
      priceId: firstItem(sub).price.id,
      hasPendingSchedule: sub.schedule !== null,
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true })
  }

  async undoCancelSubscription(subscriptionId: string): Promise<void> {
    await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: false })
  }

  async upgradeSubscription(subscriptionId: string, itemId: string, newPriceId: string): Promise<void> {
    await stripe.subscriptions.update(subscriptionId, {
      items: [{ id: itemId, price: newPriceId }],
      proration_behavior: 'always_invoice',
    })
  }

  async scheduleDowngrade(subscriptionId: string, newPriceId: string): Promise<void> {
    const sub = await stripe.subscriptions.retrieve(subscriptionId)
    const item = firstItem(sub)

    const schedule = await stripe.subscriptionSchedules.create({ from_subscription: subscriptionId })

    await stripe.subscriptionSchedules.update(schedule.id, {
      end_behavior: 'release',
      phases: [
        {
          start_date: item.current_period_start,
          end_date: item.current_period_end,
          items: sub.items.data.map((i) => ({ price: i.price.id, quantity: i.quantity ?? 1 })),
          proration_behavior: 'none',
        },
        {
          items: [{ price: newPriceId }],
          proration_behavior: 'none',
        },
      ],
    })
  }

  async getPaymentMethods(customerId: string): Promise<BillingCard[]> {
    const [customer, methods] = await Promise.all([
      stripe.customers.retrieve(customerId) as Promise<Stripe.Customer>,
      stripe.paymentMethods.list({ customer: customerId, type: 'card' }),
    ])

    const defaultPm = customer.invoice_settings.default_payment_method
    const defaultId = typeof defaultPm === 'string' ? defaultPm : defaultPm?.id

    return methods.data.map((pm) => ({
      id: pm.id,
      brand: pm.card?.brand ?? '',
      last4: pm.card?.last4 ?? '',
      expMonth: pm.card?.exp_month ?? 0,
      expYear: pm.card?.exp_year ?? 0,
      isDefault: pm.id === defaultId,
    }))
  }

  async createPortalSession(customerId: string, returnUrl: string): Promise<string> {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })
    return session.url
  }

  async createCheckoutSession(params: CheckoutSessionParams): Promise<string> {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: params.customerId,
      line_items: [{ price: params.priceId, quantity: 1 }],
      saved_payment_method_options: { payment_method_save: 'enabled' },
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: { merxUserId: params.userId, planId: params.planId },
    })
    if (!session.url) throw new Error('CheckoutSession missing URL')
    return session.url
  }

  async getInvoices(customerId: string): Promise<BillingInvoice[]> {
    const result = await stripe.invoices.list({ customer: customerId, limit: 12 })

    return result.data.map((inv) => ({
      id: inv.id,
      number: inv.number,
      date: inv.created,
      amount: inv.amount_paid,
      currency: inv.currency,
      status: inv.status as BillingInvoice['status'],
      pdfUrl: inv.invoice_pdf ?? null,
    }))
  }
}

function firstItem(sub: Stripe.Subscription): Stripe.SubscriptionItem {
  const item = sub.items.data.at(0)
  if (!item) throw new Error(`Subscription ${sub.id} has no items`)
  return item
}

// An unknown status fails the webhook (Stripe retries, error is logged) instead of being silently mapped.
function toSubscriptionStatus(status: string): SubscriptionStatus {
  if (!isSubscriptionStatus(status)) throw new Error(`Unknown Stripe subscription status: ${status}`)
  return status
}

function isSubscriptionStatus(status: string): status is SubscriptionStatus {
  return KNOWN_STATUSES.has(status)
}
