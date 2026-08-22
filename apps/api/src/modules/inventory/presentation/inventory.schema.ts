import { z } from 'zod'

export const listInventorySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
})

export const adjustSchema = z.object({
  type: z.enum(['in', 'out', 'adjustment']),
  quantity: z.number().int().nonnegative(),
  note: z.string().max(500).optional(),
})

export const reorderPointSchema = z.object({
  reorderPoint: z.number().int().nonnegative(),
})

export const setStockSchema = z.object({
  type: z.enum(['in', 'out', 'adjustment']),
  quantity: z.number().int().nonnegative(),
})

export const setStatusSchema = z.object({
  isActive: z.boolean(),
})
