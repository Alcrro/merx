import { z } from 'zod'

const codeField = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9_-]{3,50}$/, 'Doar litere mari, cifre, _ și -')

const dateField = z.string().datetime({ offset: true })

const baseFields = {
  minOrderAmount: z.number().positive().optional(),
  maxUses: z.number().int().positive().optional(),
  startsAt: dateField.optional(),
  expiresAt: dateField.optional(),
  isActive: z.boolean().default(true),
}

export const createDiscountSchema = z
  .discriminatedUnion('type', [
    z.object({
      ...baseFields,
      code: codeField,
      type: z.literal('percentage'),
      // stored as actual percent: 10.00 = 10%, max 100
      value: z.number().positive().max(100),
    }),
    z.object({
      ...baseFields,
      code: codeField,
      type: z.literal('fixed'),
      value: z.number().positive(),
    }),
  ])
  .superRefine((d, ctx) => {
    if (d.startsAt && d.expiresAt && new Date(d.expiresAt) <= new Date(d.startsAt)) {
      ctx.addIssue({
        code: 'custom',
        path: ['expiresAt'],
        message: 'Data de expirare trebuie să fie după data de start',
      })
    }
  })

export const updateDiscountSchema = z
  .object({
    value: z.number().positive().optional(),
    minOrderAmount: z.number().positive().nullable().optional(),
    maxUses: z.number().int().positive().nullable().optional(),
    startsAt: dateField.nullable().optional(),
    expiresAt: dateField.nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .superRefine((d, ctx) => {
    if (d.startsAt && d.expiresAt && new Date(d.expiresAt) <= new Date(d.startsAt)) {
      ctx.addIssue({
        code: 'custom',
        path: ['expiresAt'],
        message: 'Data de expirare trebuie să fie după data de start',
      })
    }
  })

export const listDiscountsSchema = z.object({
  isActive: z
    .string()
    .optional()
    .transform((v) => (v === 'true' ? true : v === 'false' ? false : undefined)),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

// Used by storefront — receives items, calculates subtotal server-side
export const validateDiscountSchema = z.object({
  code: codeField,
  items: z
    .array(
      z.object({
        variantId: z.string().uuid(),
        quantity: z.number().int().positive().max(999),
      }),
    )
    .min(1),
})

export type CreateDiscountInput = z.infer<typeof createDiscountSchema>
export type UpdateDiscountInput = z.infer<typeof updateDiscountSchema>
export type ValidateDiscountInput = z.infer<typeof validateDiscountSchema>
