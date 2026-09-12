import { Prisma } from '@prisma/client'
import { prisma } from '../../../../lib/prisma'

export interface CreateReservationData {
  orderId: string
  variantId?: string | null
  quantity: number
  expiresAt: Date
}

export interface ReservationRecord {
  id: string
  orderId: string
  variantId: string | null
  quantity: number
  expiresAt: Date
  confirmedAt: Date | null
  releasedAt: Date | null
  createdAt: Date
}

function toRecord(r: Prisma.InventoryReservationGetPayload<object>): ReservationRecord {
  return {
    id: r.id,
    orderId: r.orderId,
    variantId: r.variantId,
    quantity: r.quantity,
    expiresAt: r.expiresAt,
    confirmedAt: r.confirmedAt,
    releasedAt: r.releasedAt,
    createdAt: r.createdAt,
  }
}

export class InventoryReservationRepository {
  async create(tx: Prisma.TransactionClient, data: CreateReservationData): Promise<ReservationRecord> {
    const r = await tx.inventoryReservation.create({
      data: {
        orderId: data.orderId,
        variantId: data.variantId ?? null,
        quantity: data.quantity,
        expiresAt: data.expiresAt,
      },
    })
    return toRecord(r)
  }

  async confirm(tx: Prisma.TransactionClient, orderId: string): Promise<void> {
    await tx.inventoryReservation.update({
      where: { orderId },
      data: { confirmedAt: new Date() },
    })
  }

  async release(tx: Prisma.TransactionClient, orderId: string): Promise<void> {
    await tx.inventoryReservation.update({
      where: { orderId },
      data: { releasedAt: new Date() },
    })
  }

  async findByOrderId(orderId: string): Promise<ReservationRecord | null> {
    const r = await prisma.inventoryReservation.findUnique({ where: { orderId } })
    return r ? toRecord(r) : null
  }
}
