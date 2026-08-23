import { prisma } from '../../../lib/prisma'
import { discountRepository } from '../infrastructure/discount.repository'
import { reservationRepository } from '../infrastructure/reservation.repository'
import { evaluateCode } from '../domain/calculator'
import {
  DiscountNotFoundError,
  DiscountForbiddenError,
  DiscountCodeConflictError,
  DiscountInvalidError,
  DiscountMaxUsesReachedError,
} from '../domain/errors'
import type {
  DiscountCodeEntity,
  DiscountReservationEntity,
  CreateDiscountData,
  UpdateDiscountData,
  ListDiscountsParams,
  PaginatedDiscounts,
  DiscountCheckResult,
} from '../domain/entities'

export class DiscountService {
  async createDiscount(storeId: string, data: CreateDiscountData): Promise<DiscountCodeEntity> {
    const store = await prisma.store.findUnique({ where: { id: storeId } })
    if (!store) throw new DiscountNotFoundError()

    const normalized = data.code.trim().toUpperCase()

    const existing = await discountRepository.findByCode(storeId, normalized)
    if (existing) throw new DiscountCodeConflictError(normalized)

    return discountRepository.create(storeId, { ...data, code: normalized }, store.currency)
  }

  async getDiscounts(params: ListDiscountsParams): Promise<PaginatedDiscounts> {
    return discountRepository.findByStore(params)
  }

  async getDiscountById(id: string, storeId: string): Promise<DiscountCodeEntity> {
    const code = await discountRepository.findById(id, storeId)
    if (!code) throw new DiscountNotFoundError()
    return code
  }

  async updateDiscount(id: string, storeId: string, data: UpdateDiscountData): Promise<DiscountCodeEntity> {
    const existing = await discountRepository.findById(id, storeId)
    if (!existing) throw new DiscountNotFoundError()
    return discountRepository.update(id, storeId, data)
  }

  async softDeleteDiscount(id: string, storeId: string): Promise<void> {
    const existing = await discountRepository.findById(id, storeId)
    if (!existing) throw new DiscountNotFoundError()
    await discountRepository.softDelete(id, storeId)
  }

  // Returns the validation result — always resolves, never throws for invalid codes
  async validateCode(storeId: string, code: string, subtotal: number): Promise<DiscountCheckResult> {
    const store = await prisma.store.findUnique({ where: { id: storeId } })
    if (!store) return { valid: false, reason: 'CODE_NOT_FOUND' }

    const normalized = code.trim().toUpperCase()
    const discountCode = await discountRepository.findByCode(storeId, normalized)

    if (!discountCode) return { valid: false, reason: 'CODE_NOT_FOUND' }

    return evaluateCode(discountCode, store.currency, subtotal)
  }

  // Validates, atomically reserves a slot, and creates a DiscountReservation.
  // Must be called OUTSIDE a long-lived DB transaction (no external I/O inside the tx).
  async reserve(
    storeId: string,
    code: string,
    subtotal: number,
  ): Promise<DiscountReservationEntity> {
    const store = await prisma.store.findUnique({ where: { id: storeId } })
    if (!store) throw new DiscountInvalidError('CODE_NOT_FOUND')

    const normalized = code.trim().toUpperCase()
    const discountCode = await discountRepository.findByCode(storeId, normalized)
    if (!discountCode) throw new DiscountInvalidError('CODE_NOT_FOUND')

    const result = evaluateCode(discountCode, store.currency, subtotal)
    if (!result.valid) {
      throw new DiscountInvalidError(result.reason, result.minimumAmount)
    }

    const { calculatedAmount } = result.discount

    return prisma.$transaction(async (tx) => {
      const reserved = await discountRepository.tryReserve(discountCode.id, tx)
      if (!reserved) throw new DiscountMaxUsesReachedError()

      return reservationRepository.create(
        { discountCodeId: discountCode.id, storeId, amount: calculatedAmount },
        tx,
      )
    })
  }

  async attachSession(reservationId: string, stripeSessionId: string): Promise<void> {
    await reservationRepository.attachSession(reservationId, stripeSessionId)
  }

  // Called in webhook checkout.session.completed — inside the order-creation transaction
  async consume(stripeSessionId: string, tx: Parameters<typeof reservationRepository.markConsumed>[1]): Promise<DiscountReservationEntity | null> {
    const reservation = await reservationRepository.findBySessionId(stripeSessionId)
    if (!reservation) return null
    if (reservation.status !== 'reserved') return reservation
    await reservationRepository.markConsumed(reservation.id, tx)
    return { ...reservation, status: 'consumed' }
  }

  // Called in webhook checkout.session.expired / async_payment_failed
  async release(stripeSessionId: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const reservation = await reservationRepository.findBySessionId(stripeSessionId)
      if (!reservation || reservation.status !== 'reserved') return

      const released = await reservationRepository.markReleased(stripeSessionId, tx)
      if (released) {
        await discountRepository.releaseOne(reservation.discountCodeId, tx)
      }
    })
  }

  // Cron: release orphaned reservations (no stripeSessionId, older than olderThan)
  async releaseOrphans(olderThan: Date): Promise<number> {
    const orphans = await reservationRepository.findOrphans(olderThan)
    let released = 0
    for (const orphan of orphans) {
      await prisma.$transaction(async (tx) => {
        const ok = await tx.$executeRaw`
          UPDATE discount_reservations
          SET status = 'released', resolved_at = NOW()
          WHERE id = ${orphan.id} AND status = 'reserved'
        `
        if (ok === 1) {
          await discountRepository.releaseOne(orphan.discountCodeId, tx)
          released++
        }
      })
    }
    return released
  }
}

export const discountService = new DiscountService()
