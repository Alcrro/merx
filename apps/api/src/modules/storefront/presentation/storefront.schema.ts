import { z } from 'zod'

export const checkoutSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  items: z
    .array(
      z.object({
        variantId: z.string().uuid(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
  shippingAddress: z.object({
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    country: z.string().min(2).max(2),
    postalCode: z.string().min(1),
  }),
  discountCode: z.string().trim().toUpperCase().optional(),
  shippingMethodId: z.string().uuid().optional(),
})

export type CheckoutInput = z.infer<typeof checkoutSchema>

export interface CheckoutLineItem {
  variantId: string
  quantity: number
  title: string
  sku: string | null
  unitPrice: number
}
