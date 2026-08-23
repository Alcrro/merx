import { z } from 'zod'

export const createShippingMethodSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(255).optional().nullable(),
  price: z.number().min(0),
  isFree: z.boolean().default(false),
  minOrderForFree: z.number().positive().optional().nullable(),
  countries: z.array(z.string().length(2).toUpperCase()).default([]),
  isActive: z.boolean().default(true),
  position: z.number().int().min(0).optional(),
})

export const updateShippingMethodSchema = createShippingMethodSchema.partial()

export const reorderShippingSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
})

export type CreateShippingMethodInput = z.infer<typeof createShippingMethodSchema>
export type UpdateShippingMethodInput = z.infer<typeof updateShippingMethodSchema>
