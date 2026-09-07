import type { INotificationRepository } from '../domain/ports'
import type {
  NotificationEntity,
  CreateNotificationInput,
  NotificationFilters,
  NotificationsResult,
} from '../domain/entities'

export class NotificationError extends Error {
  constructor(
    message: string,
    public readonly code: 'NOT_FOUND'
  ) {
    super(message)
    this.name = 'NotificationError'
  }
}

export class NotificationService {
  constructor(private readonly repo: INotificationRepository) {}

  async create(data: CreateNotificationInput): Promise<NotificationEntity> {
    const notification = await this.repo.create(data)

    // TODO(Tier 1): apelează emailService.sendCriticalAlert() pentru CHARGEBACK_OPENED și PAYMENT_FAILED
    // try { await emailService.sendCriticalAlert(...) } catch { /* non-blocking */ }

    return notification
  }

  async markRead(id: string, storeId: string): Promise<void> {
    try {
      await this.repo.markRead(id, storeId)
    } catch (err) {
      if (err instanceof Error && (err as NodeJS.ErrnoException).code === 'NOT_FOUND') {
        throw new NotificationError('Notification not found', 'NOT_FOUND')
      }
      throw err
    }
  }

  markAllRead(storeId: string): Promise<number> {
    return this.repo.markAllRead(storeId)
  }

  findByStore(storeId: string, filters: NotificationFilters): Promise<NotificationsResult> {
    return this.repo.findByStore(storeId, filters)
  }

  deleteOlderThan(days: number): Promise<number> {
    return this.repo.deleteOlderThan(days)
  }
}
