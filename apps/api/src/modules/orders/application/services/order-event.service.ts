import type { Prisma } from '@prisma/client'
import type { OrderEventRepository, CreateOrderEventData } from '../../infrastructure/db/order-event.repository'

export class OrderEventService {
  constructor(private readonly repo: OrderEventRepository) {}

  async createEvent(tx: Prisma.TransactionClient, data: CreateOrderEventData): Promise<void> {
    await this.repo.create(tx, data)
  }
}
