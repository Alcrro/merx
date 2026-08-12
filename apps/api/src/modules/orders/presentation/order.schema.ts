import { z } from 'zod'

export const listOrdersSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
  paymentStatus: z.enum(['pending', 'paid', 'refunded', 'partially_refunded']).optional(),
  fulfillmentStatus: z.enum(['unfulfilled', 'partially_fulfilled', 'fulfilled']).optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

const orderItemSchema = z.object({
  variantId: z.string().uuid().optional().nullable(),
  title: z.string().min(1).max(255),
  sku: z.string().max(100).optional().nullable(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
})

export const createOrderSchema = z.object({
  customerId: z.string().uuid().optional().nullable(),
  currency: z.string().length(3),
  items: z.array(orderItemSchema).min(1),
  discountTotal: z.number().nonnegative().optional(),
  taxTotal: z.number().nonnegative().optional(),
  shippingTotal: z.number().nonnegative().optional(),
  shippingAddress: z.record(z.unknown()).optional().nullable(),
})

export const updateStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']),
})

export const updatePaymentStatusSchema = z.object({
  paymentStatus: z.enum(['pending', 'paid', 'refunded', 'partially_refunded']),
})

export const updateFulfillmentStatusSchema = z.object({
  fulfillmentStatus: z.enum(['unfulfilled', 'partially_fulfilled', 'fulfilled']),
})
