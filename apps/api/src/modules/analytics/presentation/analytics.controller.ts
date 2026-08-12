import type { Response } from 'express'
import type { AuthenticatedRequest } from '../../../middleware/authenticate'
import { AnalyticsService } from '../application/analytics.service'
import { analyticsRepository } from '../infrastructure/analytics.repository'
import { createAnalyticsQueue } from '../infrastructure/metrics.job'
import {
  overviewQuerySchema,
  revenueChartQuerySchema,
  topProductsQuerySchema,
  recalculateBodySchema,
} from './analytics.schema'

const service = new AnalyticsService(analyticsRepository)

export const analyticsController = {
  overview: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const query = overviewQuerySchema.parse(req.query)
    const data = await service.getOverview(req.user.storeId, query.days)
    res.json(data)
  },

  revenueChart: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const query = revenueChartQuerySchema.parse(req.query)
    const data = await service.getRevenueChart(req.user.storeId, query.days)
    res.json(data)
  },

  topProducts: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const query = topProductsQuerySchema.parse(req.query)
    const data = await service.getTopProducts(req.user.storeId, query.days, query.by)
    res.json(data)
  },

  recalculate: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const body = recalculateBodySchema.parse(req.body)
    const queue = createAnalyticsQueue()

    if (body.startDate && body.endDate) {
      const start = new Date(body.startDate)
      const end = new Date(body.endDate)
      const jobs: Promise<unknown>[] = []
      const cursor = new Date(start)
      while (cursor <= end) {
        jobs.push(queue.add('recalculate', { date: cursor.toISOString().split('T')[0] }))
        cursor.setDate(cursor.getDate() + 1)
      }
      await Promise.all(jobs)
      res.json({ queued: jobs.length })
    } else {
      const date = body.date ? new Date(body.date) : new Date()
      await queue.add('recalculate', { date: date.toISOString().split('T')[0] })
      res.json({ queued: 1 })
    }

    await queue.close()
  },
}
