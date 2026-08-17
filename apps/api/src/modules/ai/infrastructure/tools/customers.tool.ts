import { prisma } from '../../../../lib/prisma'
import type { Tool } from '@merx/llm-provider'
import { getStoreLtvQuantiles, calculateRFMScore } from '../../../customers/infrastructure/rfm.calculator'
import { getCustomerAnalytics } from '../../../customers/application/customer-analytics.service'

export const customersTools: Tool[] = [
  {
    name: 'get_customer_summary',
    description:
      'Get a complete profile of a specific customer: basic info, RFM segment, AOV comparison, order cadence, and top purchased products. Use email or customer_id to look up the customer.',
    parameters: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Customer email address. Use this if the merchant mentions an email.',
        },
        customer_id: {
          type: 'string',
          description: 'Customer UUID. Use if you already have the ID from a previous tool call.',
        },
      },
      required: [],
    },
  },
]

export async function executeGetCustomerSummary(
  storeId: string,
  args: Record<string, unknown>
): Promise<unknown> {
  const email = typeof args.email === 'string' ? args.email.trim() : null
  const customerId = typeof args.customer_id === 'string' ? args.customer_id.trim() : null

  if (!email && !customerId) {
    return { error: 'Provide either email or customer_id to look up a customer.' }
  }

  const where = customerId
    ? { id: customerId, storeId }
    : { email: email!, storeId }

  const customer = await prisma.customer.findFirst({
    where,
    include: {
      orders: {
        where: { paymentStatus: 'paid' },
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true, total: true },
      },
    },
  })

  if (!customer) {
    const lookup = customerId ? `ID ${customerId}` : `email ${email}`
    return { error: `No customer found with ${lookup} in this store.` }
  }

  const ltv = Math.round(customer.orders.reduce((s, o) => s + Number(o.total), 0) * 100) / 100
  const orderCount = customer.orders.length
  const lastOrderAt = customer.orders.length > 0
    ? customer.orders[customer.orders.length - 1].createdAt
    : null
  const firstOrderAt = customer.orders.length > 0
    ? customer.orders[0].createdAt
    : null

  const [quantiles, analytics] = await Promise.all([
    getStoreLtvQuantiles(storeId),
    getCustomerAnalytics(customer.id, storeId),
  ])

  const rfm = calculateRFMScore({ orderCount, ltv, lastOrderAt }, quantiles)

  const recentSpend = analytics.monthlySpend.slice(-3)

  return {
    customerId: customer.id,
    name: [customer.firstName, customer.lastName].filter(Boolean).join(' ') || null,
    email: customer.email,
    ltv,
    orderCount,
    firstOrderAt: firstOrderAt?.toISOString() ?? null,
    lastOrderAt: lastOrderAt?.toISOString() ?? null,
    rfm: {
      r: rfm.r,
      f: rfm.f,
      m: rfm.m,
      segment: rfm.segment,
    },
    aov: analytics.aov,
    cadence: analytics.cadence,
    topProducts: analytics.topProducts.slice(0, 3).map((p) => ({
      title: p.title,
      orderCount: p.orderCount,
      totalSpent: p.totalSpent,
    })),
    recentSpend,
  }
}
