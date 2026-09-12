import { describe, it, expect, vi, beforeEach } from 'vitest'
import { executeExpiry } from '../../infrastructure/queue/expire-pending-payment.job'
import type { InventoryReservationService } from '../../application/services/inventory-reservation.service'
import type { OrderEventRepository } from '../../infrastructure/db/order-event.repository'

vi.mock('../../../../lib/redis', () => ({
  createRedisConnection: vi.fn().mockReturnValue({}),
}))

vi.mock('bullmq', () => ({
  Queue: vi.fn().mockImplementation(() => ({ add: vi.fn() })),
  Worker: vi.fn().mockImplementation(() => ({ on: vi.fn() })),
}))

vi.mock('../../../../lib/prisma', () => {
  const mockTx = {
    order: { update: vi.fn() },
  }
  return {
    prisma: {
      order: { findUnique: vi.fn() },
      $transaction: vi.fn(async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx)),
      __mockTx: mockTx,
    },
  }
})

vi.mock('../../../../lib/stripe', () => ({
  stripe: {
    paymentIntents: { retrieve: vi.fn() },
  },
}))

describe('executeExpiry', () => {
  let inventoryReservationService: InventoryReservationService
  let orderEventRepo: OrderEventRepository
  let deps: { inventoryReservationService: InventoryReservationService; orderEventRepo: OrderEventRepository }

  beforeEach(() => {
    vi.clearAllMocks()

    inventoryReservationService = {
      reserve: vi.fn(),
      confirm: vi.fn().mockResolvedValue(undefined),
      release: vi.fn().mockResolvedValue(undefined),
      findByOrderId: vi.fn(),
    } as unknown as InventoryReservationService
    orderEventRepo = {
      create: vi.fn().mockResolvedValue(undefined),
      findByOrderId: vi.fn(),
    }
    deps = { inventoryReservationService, orderEventRepo }
  })

  it('is a no-op when order is not found', async () => {
    const { prisma } = await import('../../../../lib/prisma')
    vi.mocked(prisma.order.findUnique).mockResolvedValue(null)

    await executeExpiry({ orderId: 'o1', stripePaymentIntentId: null }, deps)

    expect(prisma.$transaction).not.toHaveBeenCalled()
  })

  it('is a no-op when order paymentStatus is already PAID', async () => {
    const { prisma } = await import('../../../../lib/prisma')
    vi.mocked(prisma.order.findUnique).mockResolvedValue({
      id: 'o1', version: 0, paymentStatus: 'PAID',
    } as never)

    await executeExpiry({ orderId: 'o1', stripePaymentIntentId: 'pi_1' }, deps)

    expect(prisma.$transaction).not.toHaveBeenCalled()
  })

  it('confirms payment when Stripe reports succeeded (webhook fallback)', async () => {
    const { prisma } = await import('../../../../lib/prisma')
    const { stripe } = await import('../../../../lib/stripe')
    const mockTx = (prisma as unknown as { __mockTx: { order: { update: ReturnType<typeof vi.fn> } } }).__mockTx

    vi.mocked(prisma.order.findUnique).mockResolvedValue({
      id: 'o1', version: 3, paymentStatus: 'PENDING',
    } as never)
    vi.mocked(stripe.paymentIntents.retrieve).mockResolvedValue({ status: 'succeeded' } as never)
    mockTx.order.update.mockResolvedValue({})

    await executeExpiry({ orderId: 'o1', stripePaymentIntentId: 'pi_1' }, deps)

    expect(mockTx.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'o1', version: 3 },
        data: expect.objectContaining({ paymentStatus: 'PAID' }),
      }),
    )
    expect(inventoryReservationService.confirm).toHaveBeenCalledWith(expect.anything(), 'o1')
    expect(orderEventRepo.create).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ eventType: 'payment.confirmed', toState: 'PAID' }),
    )
    expect(inventoryReservationService.release).not.toHaveBeenCalled()
  })

  it('cancels order when Stripe reports requires_payment_method', async () => {
    const { prisma } = await import('../../../../lib/prisma')
    const { stripe } = await import('../../../../lib/stripe')
    const mockTx = (prisma as unknown as { __mockTx: { order: { update: ReturnType<typeof vi.fn> } } }).__mockTx

    vi.mocked(prisma.order.findUnique).mockResolvedValue({
      id: 'o1', version: 1, paymentStatus: 'PENDING',
    } as never)
    vi.mocked(stripe.paymentIntents.retrieve).mockResolvedValue({ status: 'requires_payment_method' } as never)
    mockTx.order.update.mockResolvedValue({})

    await executeExpiry({ orderId: 'o1', stripePaymentIntentId: 'pi_1' }, deps)

    expect(mockTx.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ paymentStatus: 'VOID', status: 'CANCELLED' }),
      }),
    )
    expect(inventoryReservationService.release).toHaveBeenCalledWith(expect.anything(), 'o1')
    expect(orderEventRepo.create).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ eventType: 'order.auto_cancelled' }),
    )
    expect(inventoryReservationService.confirm).not.toHaveBeenCalled()
  })

  it('cancels order when stripePaymentIntentId is null', async () => {
    const { prisma } = await import('../../../../lib/prisma')
    const mockTx = (prisma as unknown as { __mockTx: { order: { update: ReturnType<typeof vi.fn> } } }).__mockTx

    vi.mocked(prisma.order.findUnique).mockResolvedValue({
      id: 'o1', version: 0, paymentStatus: 'PENDING',
    } as never)
    mockTx.order.update.mockResolvedValue({})

    await executeExpiry({ orderId: 'o1', stripePaymentIntentId: null }, deps)

    expect(mockTx.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ paymentStatus: 'VOID', status: 'CANCELLED' }),
      }),
    )
    expect(inventoryReservationService.release).toHaveBeenCalled()
  })
})
