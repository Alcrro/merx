import { z } from 'zod'

export const updateStoreSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  currency: z.string().length(3).toUpperCase().optional(),
  locale: z.string().min(2).max(10).optional(),
  timezone: z.string().min(1).optional(),
})
