import { z } from 'zod'

export const createSessionSchema = z.object({
  title: z.string().max(120).optional(),
})

export const chatMessageSchema = z.object({
  message: z.string().min(1).max(4000),
})

export const restockSchema = z.object({
  quantity: z.number().int().min(1).max(100000),
})
