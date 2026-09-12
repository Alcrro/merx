import type { Response, NextFunction } from 'express'
import type { AuthenticatedStoreRequest as AuthenticatedRequest } from '../../../middleware/authenticate'
import { NotificationService, NotificationError } from '../application/notification.service'
import { NotificationRepository } from '../infrastructure/notification.repository'
import { listNotificationsSchema } from './notification.schema'

const service = new NotificationService(new NotificationRepository())

function handleError(err: unknown, res: Response): void {
  if (err instanceof NotificationError) {
    res.status(404).json({ error: err.message })
    return
  }
  throw err
}

export const notificationController = {
  list: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const filters = listNotificationsSchema.parse(req.query)
      const result = await service.findByStore(req.user.storeId, filters)
      res.json(result)
    } catch (err) {
      if (err instanceof NotificationError) handleError(err, res); else next(err)
    }
  },

  markRead: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await service.markRead(req.params.id, req.user.storeId)
      res.json({ ok: true })
    } catch (err) {
      if (err instanceof NotificationError) handleError(err, res); else next(err)
    }
  },

  markAllRead: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const updated = await service.markAllRead(req.user.storeId)
      res.json({ updated })
    } catch (err) {
      next(err)
    }
  },
}
