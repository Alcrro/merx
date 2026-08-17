import { z } from 'zod'
import { ThemeConfigSchema } from '../domain/theme.schema'

export const applyPatchSchema = z.object({
  config: ThemeConfigSchema,
})

export const publishSchema = z.object({
  forcePublish: z.boolean().optional().default(false),
})

export const rollbackSchema = z.object({
  versionId: z.string().uuid(),
})
