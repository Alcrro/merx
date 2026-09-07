import type {
  NotificationEntity,
  CreateNotificationInput,
  NotificationFilters,
  NotificationsResult,
} from './entities'

export interface INotificationRepository {
  create(data: CreateNotificationInput): Promise<NotificationEntity>
  markRead(id: string, storeId: string): Promise<void>
  markAllRead(storeId: string): Promise<number>
  findByStore(storeId: string, filters: NotificationFilters): Promise<NotificationsResult>
  deleteOlderThan(days: number): Promise<number>
}
