import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { prisma } from '../../../../lib/prisma'
import { OrderWebhookService } from '../../application/services/webhook.service'
import { ProcessedWebhookRepository } from '../../infrastructure/db/processed-webhook.repository'
import { OrderEventRepository } from '../../infrastructure/db/order-event.repository'
import { InventoryReservationService } from '../../application/services/inventory-reservation.service'
import { InventoryReservationRepository } from '../../infrastructure/db/inventory-reservation.repository'
import type Stripe from 'stripe'

const TEST_EMAIL = 'webhook-integration@test.example.com'
const TEST_PI_ID = 'pi_integration_test_001'

async function cleanup(): Promise<void> {
  await prisma.processedWebhook.deleteMany({ where: { stripeEventId: { startsWith: 'evt_integration_' } } })
  const user = await prisma.user.findUnique({ where: { email: TEST_EMAIL } })
  if (!user) return
  const stores = await prisma.store.findMany({ where: { ownerId: user.id } })
  for (const store of stores) {
    const orders = await prisma.order.findMany({ where: { storeId: store.id } })
    for (const order of orders) {
      await prisma.orderEvent.deleteMany({ where: { orderId: order.id } })
      await prisma.inventoryReservation.deleteMany({ where: { orderId: order.id } })
    }
    await prisma.order.deleteMany({ where: { storeId: store.id } })
  }
  await prisma.store.deleteMany({ where: { ownerId: user.id } })
  await prisma.user.delete({ where: { id: user.id } })
}

async function seedOrderWithPendingPayment(): Promise<{ orderId: string; storeId: string }> {
  const user = await prisma.user.create({
    data: { email: TEST_EMAIL, name: 'Webhook Test', password: 'hashed' },
  })
  const store = await prisma.store.create({
    data: { ownerId: user.id, name: 'Test Store', slug: `test-webhook-${Date.now()}`, currency: 'RON' },
  })
  const order = await prisma.order.create({
    data: {
      storeId: store.id,
      orderNumber: 99001,
      status: 'ACTIVE',
      paymentStatus: 'PENDING',
      fulfillmentStatus: 'UNFULFILLED',
      source: 'storefront',
      currency: 'RON',
      subtotal: 100,
      discountTotal: 0,
      taxTotal: 19,
      shippingTotal: 0,
      total: 119,
      version: 0,
      stripePaymentIntentId: TEST_PI_ID,
    },
  })
  await prisma.inventoryReservation.create({
    data: {
      orderId: order.id,
      quantity: 1,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    },
  })
  return { orderId: order.id, storeId: store.id }
}

function makeEvent(overrides: Partial<Stripe.Event> = {}): Stripe.Event {
  return {
    id: 'evt_integration_001',
    object: 'event',
    api_version: '2023-10-16',
    created: Math.floor(Date.now() / 1000),
    livemode: false,
    pending_webhooks: 1,
    request: null,
    type: 'payment_intent.succeeded',
    data: {
      object: { id: TEST_PI_ID, object: 'payment_intent', status: 'succeeded' } as Stripe.PaymentIntent,
    },
    ...overrides,
  } as Stripe.Event
}

describe('OrderWebhookService (integration)', () => {
  let service: OrderWebhookService
  let scheduleEmail: ReturnType<typeof import('vitest').vi.fn>

  beforeEach(async () => {
    await cleanup()

    const processedWebhookRepo = new ProcessedWebhookRepository()
    const orderEventRepo = new OrderEventRepository()
    const inventoryReservationService = new InventoryReservationService(new InventoryReservationRepository())
    const { vi } = await import('vitest')
    scheduleEmail = vi.fn().mockResolvedValue(undefined)

    service = new OrderWebhookService(
      processedWebhookRepo,
      orderEventRepo,
      inventoryReservationService,
      scheduleEmail as (orderId: string) => Promise<void>,
    )
  })

  afterEach(async () => {
    await cleanup()
  })

  it('payment_intent.succeeded — updates order to PAID and creates OrderEvent', async () => {
    const { orderId } = await seedOrderWithPendingPayment()

    await service.handleStripeEvent(makeEvent())

    const order = await prisma.order.findUnique({ where: { id: orderId } })
    expect(order?.paymentStatus).toBe('PAID')
    expect(order?.version).toBe(1)
    expect(order?.paymentEventAt).not.toBeNull()

    const events = await prisma.orderEvent.findMany({ where: { orderId } })
    expect(events).toHaveLength(1)
    expect(events[0].eventType).toBe('payment.confirmed')
    expect(events[0].toState).toBe('PAID')

    const reservation = await prisma.inventoryReservation.findUnique({ where: { orderId } })
    expect(reservation?.confirmedAt).not.toBeNull()

    expect(scheduleEmail).toHaveBeenCalledWith(orderId)
  })

  it('is idempotent — second call with same event.id does not update again', async () => {
    const { orderId } = await seedOrderWithPendingPayment()
    const event = makeEvent()

    await service.handleStripeEvent(event)
    await service.handleStripeEvent(event)

    const order = await prisma.order.findUnique({ where: { id: orderId } })
    expect(order?.version).toBe(1)

    const events = await prisma.orderEvent.findMany({ where: { orderId } })
    expect(events).toHaveLength(1)

    expect(scheduleEmail).toHaveBeenCalledTimes(1)
  })

  it('ignores event for unknown stripePaymentIntentId (order from another store / unknown)', async () => {
    await seedOrderWithPendingPayment()

    const foreignEvent = makeEvent({
      id: 'evt_integration_foreign',
      data: {
        object: { id: 'pi_unknown_xxx', object: 'payment_intent', status: 'succeeded' } as Stripe.PaymentIntent,
      },
    })

    await service.handleStripeEvent(foreignEvent)

    const count = await prisma.orderEvent.count()
    expect(count).toBe(0)
    expect(scheduleEmail).not.toHaveBeenCalled()
  })
})
