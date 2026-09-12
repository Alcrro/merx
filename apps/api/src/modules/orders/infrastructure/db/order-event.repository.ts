import { Prisma } from '@prisma/client'
import { prisma } from '../../../../lib/prisma'

export interface CreateOrderEventData {
  orderId: string
  eventType: string
  fromState?: string | null
  toState?: string | null
  actorType: string
  actorId?: string | null
  metadata?: Record<string, unknown>
}

export interface OrderEventRecord {
  id: string
  orderId: string
  eventType: string
  fromState: string | null
  toState: string | null
  actorType: string
  actorId: string | null
  metadata: Record<string, unknown>
  createdAt: Date
}

function toRecord(e: Prisma.OrderEventGetPayload<object>): OrderEventRecord {
  return {
    id: e.id,
    orderId: e.orderId,
    eventType: e.eventType,
    fromState: e.fromState,
    toState: e.toState,
    actorType: e.actorType,
    actorId: e.actorId,
    metadata: e.metadata as Record<string, unknown>,
    createdAt: e.createdAt,
  }
}

export class OrderEventRepository {
  async create(tx: Prisma.TransactionClient, data: CreateOrderEventData): Promise<OrderEventRecord> {
    const e = await tx.orderEvent.create({
      data: {
        orderId: data.orderId,
        eventType: data.eventType,
        fromState: data.fromState ?? null,
        toState: data.toState ?? null,
        actorType: data.actorType,
        actorId: data.actorId ?? null,
        metadata: (data.metadata ?? {}) as Prisma.InputJsonValue,
      },
    })
    return toRecord(e)
  }

  async findByOrderId(orderId: string): Promise<OrderEventRecord[]> {
    const events = await prisma.orderEvent.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    })
    return events.map(toRecord)
  }
}
