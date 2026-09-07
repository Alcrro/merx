import { Prisma } from '@prisma/client'
import { prisma } from '../../../lib/prisma'
import type { INotificationRepository } from '../domain/ports'
import type {
  NotificationEntity,
  CreateNotificationInput,
  NotificationFilters,
  NotificationsResult,
  NotificationType,
  NotificationSeverity,
} from '../domain/entities'

function toEntity(n: Prisma.NotificationGetPayload<object>): NotificationEntity {
  return {
    ...n,
    type: n.type as NotificationType,
    severity: n.severity as NotificationSeverity,
    metadata: n.metadata as Record<string, unknown> | null,
  }
}

function dateRangeStart(range: NonNullable<NotificationFilters['dateRange']>): Date {
  const now = new Date()
  if (range === 'today') {
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  }
  const days = { '3d': 3, '7d': 7, '14d': 14, '30d': 30 }[range]
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
}

export class NotificationRepository implements INotificationRepository {
  async create(data: CreateNotificationInput): Promise<NotificationEntity> {
    const n = await prisma.notification.create({
      data: {
        storeId: data.storeId,
        type: data.type,
        severity: data.severity,
        title: data.title,
        message: data.message,
        metadata: (data.metadata ?? Prisma.JsonNull) as Prisma.InputJsonValue,
      },
    })
    return toEntity(n)
  }

  async markRead(id: string, storeId: string): Promise<void> {
    const result = await prisma.notification.updateMany({
      where: { id, storeId, readAt: null },
      data: { readAt: new Date() },
    })
    if (result.count === 0) {
      const exists = await prisma.notification.findFirst({ where: { id, storeId } })
      if (!exists) throw Object.assign(new Error('Notification not found'), { code: 'NOT_FOUND' })
    }
  }

  async markAllRead(storeId: string): Promise<number> {
    const result = await prisma.notification.updateMany({
      where: { storeId, readAt: null },
      data: { readAt: new Date() },
    })
    return result.count
  }

  async findByStore(storeId: string, filters: NotificationFilters): Promise<NotificationsResult> {
    const { limit = 20, severity, dateRange, search, unreadOnly, page = 1 } = filters

    const where: Prisma.NotificationWhereInput = {
      storeId,
      ...(severity && { severity }),
      ...(dateRange && { createdAt: { gte: dateRangeStart(dateRange) } }),
      ...(unreadOnly && { readAt: null }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { message: { contains: search, mode: 'insensitive' } },
        ],
      }),
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { storeId, readAt: null } }),
    ])

    return { notifications: notifications.map(toEntity), unreadCount, total }
  }

  async deleteOlderThan(days: number): Promise<number> {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    const result = await prisma.notification.deleteMany({
      where: { createdAt: { lt: cutoff } },
    })
    return result.count
  }
}
