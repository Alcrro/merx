import { prisma } from '../../../lib/prisma'
import type { IDiscountReservationRepository } from '../domain/ports'
import type { DiscountReservationEntity } from '../domain/entities'
import type { PrismaClient } from '@prisma/client'

type Tx = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>

function mapReservation(row: {
  id: string
  discountCodeId: string
  storeId: string
  stripeSessionId: string | null
  amount: { toNumber(): number }
  status: string
  createdAt: Date
  resolvedAt: Date | null
}): DiscountReservationEntity {
  return {
    ...row,
    status: row.status as DiscountReservationEntity['status'],
    amount: row.amount.toNumber(),
  }
}

export class ReservationRepository implements IDiscountReservationRepository {
  async create(
    data: { discountCodeId: string; storeId: string; amount: number },
    tx: Tx,
  ): Promise<DiscountReservationEntity> {
    const row = await tx.discountReservation.create({
      data: {
        discountCodeId: data.discountCodeId,
        storeId: data.storeId,
        amount: data.amount,
        status: 'reserved',
      },
    })
    return mapReservation(row)
  }

  async attachSession(id: string, stripeSessionId: string): Promise<void> {
    await prisma.discountReservation.update({
      where: { id },
      data: { stripeSessionId },
    })
  }

  async findBySessionId(stripeSessionId: string): Promise<DiscountReservationEntity | null> {
    const row = await prisma.discountReservation.findUnique({
      where: { stripeSessionId },
    })
    return row ? mapReservation(row) : null
  }

  async markConsumed(id: string, tx: Tx): Promise<void> {
    await tx.discountReservation.update({
      where: { id },
      data: { status: 'consumed', resolvedAt: new Date() },
    })
  }

  // Returns true if a reserved row was found and released (idempotent — 0 rows = already resolved)
  async markReleased(stripeSessionId: string, tx: Tx): Promise<boolean> {
    const result = await tx.$executeRaw`
      UPDATE discount_reservations
      SET status = 'released', resolved_at = NOW()
      WHERE stripe_session_id = ${stripeSessionId}
        AND status = 'reserved'
    `
    return result === 1
  }

  async findOrphans(olderThan: Date): Promise<DiscountReservationEntity[]> {
    const rows = await prisma.discountReservation.findMany({
      where: {
        status: 'reserved',
        stripeSessionId: null,
        createdAt: { lt: olderThan },
      },
    })
    return rows.map(mapReservation)
  }
}

export const reservationRepository = new ReservationRepository()
