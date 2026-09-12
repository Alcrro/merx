import { describe, it, expect, vi, beforeEach } from 'vitest'
import { OrderWebhookService } from '../../application/services/webhook.service'
import type { ProcessedWebhookRepository } from '../../infrastructure/db/processed-webhook.repository'
import type { OrderEventRepository } from '../../infrastructure/db/order-event.repository'
import type { InventoryReservationService } from '../../application/services/inventory-reservation.service'

vi.mock('../../../../lib/prisma', () => {
  const mockTx = {
    order: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    processedWebhook: {
      create: vi.fn(),
    },
  }
  return {
    prisma: {
      $transaction: vi.fn(async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx)),
      __mockTx: mockTx,
    },
  }
})

function makeStripeEvent(overrides: Record<string, unknown> = {}) {
  return {
    id: 'evt_test_1',
    type: 'payment_intent.succeeded',
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: 'pi_test_1',
        status: 'succeeded',
      },
    },
    ...overrides,
  }
}

describe('OrderWebhookService', () => {
  let processedWebhookRepo: ProcessedWebhookRepository
  let orderEventRepo: OrderEventRepository
  let inventoryReservationService: InventoryReservationService
  let scheduleEmail: ReturnType<typeof vi.fn>
  let service: OrderWebhookService

  beforeEach(async () => {
    vi.clearAllMocks()

    processedWebhookRepo = {
      exists: vi.fn().mockResolvedValue(false),
      create: vi.fn().mockResolvedValue(undefined),
    }
    orderEventRepo = { create: vi.fn().mockResolvedValue(undefined), findByOrderId: vi.fn() }
    inventoryReservationService = {
      reserve: vi.fn(),
      confirm: vi.fn().mockResolvedValue(undefined),
      release: vi.fn(),
      findByOrderId: vi.fn(),
    } as unknown as InventoryReservationService
    scheduleEmail = vi.fn().mockResolvedValue(undefined)

    service = new OrderWebhookService(
      processedWebhookRepo,
      orderEventRepo,
      inventoryReservationService,
      scheduleEmail as (orderId: string) => Promise<void>,
    )
  })

  it('is idempotent — second call with same event.id is a no-op', async () => {
    vi.mocked(processedWebhookRepo.exists).mockResolvedValue(true)
    const { prisma } = await import('../../../../lib/prisma')

    await service.handleStripeEvent(makeStripeEvent() as never)

    expect(prisma.$transaction).not.toHaveBeenCalled()
    expect(orderEventRepo.create).not.toHaveBeenCalled()
  })

  it('skips out-of-order events (older than paymentEventAt)', async () => {
    const { prisma } = await import('../../../../lib/prisma')
    const mockTx = (prisma as unknown as { __mockTx: { order: { findUnique: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> } } }).__mockTx

    const now = Math.floor(Date.now() / 1000)
    mockTx.order.findUnique.mockResolvedValue({
      id: 'o1',
      version: 0,
      paymentStatus: 'PAID',
      paymentEventAt: new Date((now + 10) * 1000),  // 10s in the future = newer event already processed
      stripePaymentIntentId: 'pi_test_1',
    })

    await service.handleStripeEvent(makeStripeEvent({ created: now }) as never)

    expect(mockTx.order.update).not.toHaveBeenCalled()
    expect(inventoryReservationService.confirm).not.toHaveBeenCalled()
  })

  it('skips when payment transition is invalid (PAID → PAID)', async () => {
    const { prisma } = await import('../../../../lib/prisma')
    const mockTx = (prisma as unknown as { __mockTx: { order: { findUnique: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> } } }).__mockTx

    mockTx.order.findUnique.mockResolvedValue({
      id: 'o1',
      version: 0,
      paymentStatus: 'PAID',
      paymentEventAt: null,
      stripePaymentIntentId: 'pi_test_1',
    })

    await service.handleStripeEvent(makeStripeEvent() as never)

    expect(mockTx.order.update).not.toHaveBeenCalled()
  })

  it('processes payment_intent.succeeded for PENDING order', async () => {
    const { prisma } = await import('../../../../lib/prisma')
    const mockTx = (prisma as unknown as { __mockTx: { order: { findUnique: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> } } }).__mockTx

    mockTx.order.findUnique.mockResolvedValue({
      id: 'o1',
      version: 2,
      paymentStatus: 'PENDING',
      paymentEventAt: null,
      stripePaymentIntentId: 'pi_test_1',
    })
    mockTx.order.update.mockResolvedValue({})

    await service.handleStripeEvent(makeStripeEvent() as never)

    expect(mockTx.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'o1', version: 2 },
        data: expect.objectContaining({ paymentStatus: 'PAID' }),
      }),
    )
    expect(inventoryReservationService.confirm).toHaveBeenCalledWith(expect.anything(), 'o1')
    expect(orderEventRepo.create).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ eventType: 'payment.confirmed', toState: 'PAID' }),
    )
    expect(scheduleEmail).toHaveBeenCalledWith('o1')
  })

  it('processes payment_intent.payment_failed for PENDING order', async () => {
    const { prisma } = await import('../../../../lib/prisma')
    const mockTx = (prisma as unknown as { __mockTx: { order: { findUnique: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> } } }).__mockTx

    mockTx.order.findUnique.mockResolvedValue({
      id: 'o1',
      version: 1,
      paymentStatus: 'PENDING',
      paymentEventAt: null,
      stripePaymentIntentId: 'pi_test_1',
    })
    mockTx.order.update.mockResolvedValue({})

    await service.handleStripeEvent(makeStripeEvent({ type: 'payment_intent.payment_failed' }) as never)

    expect(mockTx.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ paymentStatus: 'PAYMENT_FAILED' }),
      }),
    )
    expect(orderEventRepo.create).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ eventType: 'payment.failed', toState: 'PAYMENT_FAILED' }),
    )
    expect(inventoryReservationService.confirm).not.toHaveBeenCalled()
  })
})
