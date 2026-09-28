import { z } from 'zod'
import { PAID_PLAN_IDS } from '../../domain/plan-change'

export const billingValidator = {
  // Enterprise has no self-serve flow — only paid self-serve plans are accepted.
  plan: z.object({
    planId: z.enum(PAID_PLAN_IDS),
  }),
}
