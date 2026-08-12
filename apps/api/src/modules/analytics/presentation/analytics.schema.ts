import { z } from 'zod'

export const overviewQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(30),
})

export const revenueChartQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(30),
})

export const topProductsQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(30),
  by: z.enum(['revenue', 'units']).default('revenue'),
})

export const recalculateBodySchema = z.object({
  date: z.string().date().optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
})
