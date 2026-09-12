import { z } from 'zod'

const orderItemSchema = z.object({
  variantId: z.string().uuid().optional().nullable(),
  title: z.string().min(1).max(255),
  sku: z.string().max(100).optional().nullable(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
})

export const orderValidator = {
  list: z.object({
    status: z.enum(['DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED']).optional(),
    paymentStatus: z.enum(['PENDING', 'AUTHORIZED', 'PAID', 'PAYMENT_FAILED', 'VOID', 'REFUND_PENDING', 'PARTIALLY_REFUNDED', 'REFUNDED']).optional(),
    fulfillmentStatus: z.enum(['UNFULFILLED', 'PROCESSING', 'SHIPPED', 'LOST_IN_TRANSIT', 'DELIVERED', 'FULFILLED', 'RETURN_IN_TRANSIT', 'RETURNED']).optional(),
    startDate: z.string().date().optional(),
    endDate: z.string().date().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),

  create: z.object({
    customerId: z.string().uuid().optional().nullable(),
    currency: z.string().length(3),
    items: z.array(orderItemSchema).min(1),
    discountTotal: z.number().nonnegative().optional(),
    taxTotal: z.number().nonnegative().optional(),
    shippingTotal: z.number().nonnegative().optional(),
    shippingAddress: z.record(z.unknown()).optional().nullable(),
  }),

  updateStatus: z.object({
    status: z.enum(['DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED']),
  }),

  updatePaymentStatus: z.object({
    paymentStatus: z.enum(['PENDING', 'AUTHORIZED', 'PAID', 'PAYMENT_FAILED', 'VOID', 'REFUND_PENDING', 'PARTIALLY_REFUNDED', 'REFUNDED']),
  }),

  updateFulfillmentStatus: z.object({
    fulfillmentStatus: z.enum(['UNFULFILLED', 'PROCESSING', 'SHIPPED', 'LOST_IN_TRANSIT', 'DELIVERED', 'FULFILLED', 'RETURN_IN_TRANSIT', 'RETURNED']),
  }),

  refund: z.object({
    amount: z.number().positive().max(1_000_000).optional(),
  }),
}
