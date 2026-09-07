import { z } from 'zod'

export const listNotificationsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  page: z.coerce.number().int().min(1).default(1),
  severity: z.enum(['INFO', 'SUCCESS', 'WARNING', 'ERROR']).optional(),
  dateRange: z.enum(['today', '3d', '7d', '14d', '30d']).optional(),
  search: z.string().max(200).optional(),
  unreadOnly: z.coerce.boolean().optional(),
})

export const notificationResponseSchema = z.object({
  id: z.string(),
  storeId: z.string(),
  type: z.enum([
    'ORDER_NEW',
    'ORDER_CANCELLED',
    'REFUND_REQUESTED',
    'REFUND_PROCESSED',
    'STOCK_LOW',
    'STOCK_OUT',
    'PAYMENT_FAILED',
    'CHARGEBACK_OPENED',
    'AI_ACTION',
    'SYSTEM_WEBHOOK_FAILED',
  ]),
  severity: z.enum(['INFO', 'SUCCESS', 'WARNING', 'ERROR']),
  title: z.string(),
  message: z.string(),
  metadata: z.record(z.unknown()).nullable(),
  readAt: z.date().nullable(),
  createdAt: z.date(),
})
