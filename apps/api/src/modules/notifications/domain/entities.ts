export type NotificationType =
  | 'ORDER_NEW'
  | 'ORDER_CANCELLED'
  | 'REFUND_REQUESTED'
  | 'REFUND_PROCESSED'
  | 'STOCK_LOW'
  | 'STOCK_OUT'
  | 'STOCK_IN'
  | 'STOCK_REMOVAL'
  | 'STOCK_ADJUSTMENT'
  | 'PAYMENT_FAILED'
  | 'CHARGEBACK_OPENED'
  | 'AI_ACTION'
  | 'SYSTEM_WEBHOOK_FAILED'

export type NotificationSeverity = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'

export interface NotificationEntity {
  id: string
  storeId: string
  type: NotificationType
  severity: NotificationSeverity
  title: string
  message: string
  metadata: Record<string, unknown> | null
  readAt: Date | null
  createdAt: Date
}

export interface NotificationFilters {
  limit?: number
  severity?: NotificationSeverity
  dateRange?: 'today' | '3d' | '7d' | '14d' | '30d'
  search?: string
  unreadOnly?: boolean
  page?: number
}

export interface CreateNotificationInput {
  storeId: string
  type: NotificationType
  severity: NotificationSeverity
  title: string
  message: string
  metadata?: Record<string, unknown>
}

export interface NotificationsResult {
  notifications: NotificationEntity[]
  unreadCount: number
  total: number
}
