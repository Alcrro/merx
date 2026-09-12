import { Prisma } from '@prisma/client'
import { prisma } from '../../../../lib/prisma'

export class ProcessedWebhookRepository {
  async exists(stripeEventId: string): Promise<boolean> {
    const count = await prisma.processedWebhook.count({ where: { stripeEventId } })
    return count > 0
  }

  async create(tx: Prisma.TransactionClient, stripeEventId: string): Promise<void> {
    await tx.processedWebhook.create({ data: { stripeEventId } })
  }
}
