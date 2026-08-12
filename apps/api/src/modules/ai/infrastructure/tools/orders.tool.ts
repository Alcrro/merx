import { prisma } from '../../../../lib/prisma'
import type { Tool } from '@merx/llm-provider'

export const ordersTools: Tool[] = [
  {
    name: 'get_recent_orders',
    description:
      'Get a list of recent orders for the store. Can filter by fulfillment status or payment status. Returns order number, total, customer, and status.',
    parameters: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Number of orders to return. Defaults to 20, max 50.' },
        fulfillment_status: {
          type: 'string',
          enum: ['unfulfilled', 'partially_fulfilled', 'fulfilled', 'cancelled'],
          description: 'Filter by fulfillment status.',
        },
        payment_status: {
          type: 'string',
          enum: ['pending', 'paid', 'refunded', 'failed'],
          description: 'Filter by payment status.',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_order_details',
    description: 'Get full details of a specific order including line items and customer info.',
    parameters: {
      type: 'object',
      properties: {
        order_number: { type: 'number', description: 'The order number (e.g. 1042).' },
      },
      required: ['order_number'],
    },
  },
]

export async function executeGetRecentOrders(
  storeId: string,
  args: Record<string, unknown>
): Promise<unknown> {
  const limit = typeof args.limit === 'number' ? Math.min(args.limit, 50) : 20

  const where: Record<string, unknown> = { storeId }
  if (typeof args.fulfillment_status === 'string') {
    where.fulfillmentStatus = args.fulfillment_status
  }
  if (typeof args.payment_status === 'string') {
    where.paymentStatus = args.payment_status
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      customer: { select: { email: true, firstName: true, lastName: true } },
      _count: { select: { items: true } },
    },
  })

  return {
    count: orders.length,
    orders: orders.map((o) => ({
      orderNumber: o.orderNumber,
      status: o.status,
      paymentStatus: o.paymentStatus,
      fulfillmentStatus: o.fulfillmentStatus,
      total: Number(o.total),
      currency: o.currency,
      itemCount: o._count.items,
      customer: o.customer
        ? {
            email: o.customer.email,
            name: [o.customer.firstName, o.customer.lastName].filter(Boolean).join(' ') || null,
          }
        : null,
      createdAt: o.createdAt.toISOString(),
    })),
  }
}

export async function executeGetOrderDetails(
  storeId: string,
  args: Record<string, unknown>
): Promise<unknown> {
  const orderNumber = typeof args.order_number === 'number' ? args.order_number : null
  if (!orderNumber) return { error: 'order_number is required' }

  const order = await prisma.order.findFirst({
    where: { storeId, orderNumber },
    include: {
      customer: true,
      items: {
        include: {
          variant: {
            select: {
              sku: true,
              title: true,
              product: { select: { title: true } },
            },
          },
        },
      },
    },
  })

  if (!order) return { error: `Order #${orderNumber} not found` }

  return {
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    fulfillmentStatus: order.fulfillmentStatus,
    currency: order.currency,
    subtotal: Number(order.subtotal),
    discountTotal: Number(order.discountTotal),
    taxTotal: Number(order.taxTotal),
    shippingTotal: Number(order.shippingTotal),
    total: Number(order.total),
    customer: order.customer
      ? {
          email: order.customer.email,
          firstName: order.customer.firstName,
          lastName: order.customer.lastName,
        }
      : null,
    shippingAddress: order.shippingAddress,
    items: order.items.map((item) => ({
      title: item.title,
      sku: item.sku,
      productTitle: item.variant?.product.title ?? null,
      variantTitle: item.variant?.title ?? null,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      total: Number(item.total),
    })),
    createdAt: order.createdAt.toISOString(),
  }
}
