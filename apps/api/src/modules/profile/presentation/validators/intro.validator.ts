import { z } from 'zod'

export const introValidator = {
  complete: z.object({
    name: z.string().min(2).max(50).trim(),
  }),
}
