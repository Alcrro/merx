import { z } from 'zod'

export const addFollowUpSchema = z.object({
  followUpText: z.string().min(1).max(1000),
})

export const toolNameParamSchema = z.object({
  toolName: z.enum(['catalog-generator', 'moderation', 'variant-classify', 'archive']),
})
