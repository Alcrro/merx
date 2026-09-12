import type { Prisma } from '@prisma/client'
import type {
  InventoryReservationRepository,
  CreateReservationData,
  ReservationRecord,
} from '../../infrastructure/db/inventory-reservation.repository'

export class InventoryReservationService {
  constructor(private readonly repo: InventoryReservationRepository) {}

  async reserve(tx: Prisma.TransactionClient, data: CreateReservationData): Promise<ReservationRecord> {
    return this.repo.create(tx, data)
  }

  async confirm(tx: Prisma.TransactionClient, orderId: string): Promise<void> {
    await this.repo.confirm(tx, orderId)

    const reservation = await tx.inventoryReservation.findUnique({
      where: { orderId },
      select: { variantId: true, quantity: true },
    })

    if (reservation?.variantId) {
      await tx.inventoryItem.update({
        where: { variantId: reservation.variantId },
        data: { quantity: { decrement: reservation.quantity } },
      })
    }
  }

  async release(tx: Prisma.TransactionClient, orderId: string): Promise<void> {
    await this.repo.release(tx, orderId)
  }

  async findByOrderId(orderId: string): Promise<ReservationRecord | null> {
    return this.repo.findByOrderId(orderId)
  }
}
