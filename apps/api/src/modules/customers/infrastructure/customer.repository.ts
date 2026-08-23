import { Prisma } from '@prisma/client'
import { prisma } from '../../../lib/prisma'
import type { ICustomerRepository } from '../domain/ports'
import type {
  CustomerWithStats,
  CustomerDetail,
  ListCustomersParams,
  PaginatedCustomers,
} from '../domain/entities'
import { getStoreLtvQuantiles, calculateRFMScore } from './rfm.calculator'

interface RawCustomerRow {
  id: string
  store_id: string
  email: string
  first_name: string | null
  last_name: string | null
  created_at: Date
  updated_at: Date
  order_count: string
  ltv: string
  last_order_at: Date | null
}

function toCustomerWithStats(r: RawCustomerRow, quantiles: number[]): CustomerWithStats {
  const orderCount = parseInt(r.order_count, 10)
  const ltv = Math.round(parseFloat(r.ltv) * 100) / 100
  return {
    id: r.id,
    storeId: r.store_id,
    email: r.email,
    firstName: r.first_name,
    lastName: r.last_name,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    orderCount,
    ltv,
    lastOrderAt: r.last_order_at,
    rfm: calculateRFMScore({ orderCount, ltv, lastOrderAt: r.last_order_at }, quantiles),
  }
}

function orderBySql(sortBy: string): Prisma.Sql {
  switch (sortBy) {
    case 'orderCount': return Prisma.sql`ORDER BY order_count DESC`
    case 'createdAt': return Prisma.sql`ORDER BY c.created_at DESC`
    case 'lastOrderAt': return Prisma.sql`ORDER BY last_order_at DESC NULLS LAST`
    default: return Prisma.sql`ORDER BY ltv DESC`
  }
}

export class CustomerRepository implements ICustomerRepository {
  async list(params: ListCustomersParams): Promise<PaginatedCustomers> {
    const { storeId, search, sortBy = 'ltv', page, limit } = params
    const offset = (page - 1) * limit
    const searchPattern = search ? `%${search}%` : '%'
    const orderSql = orderBySql(sortBy)

    const quantiles = await getStoreLtvQuantiles(storeId)

    const [rows, countRows] = await Promise.all([
      prisma.$queryRaw<RawCustomerRow[]>`
        SELECT
          c.id,
          c.store_id,
          c.email,
          c.first_name,
          c.last_name,
          c.created_at,
          c.updated_at,
          COUNT(o.id)::text AS order_count,
          COALESCE(SUM(CASE WHEN o.payment_status = 'paid' THEN o.total ELSE 0 END), 0)::text AS ltv,
          MAX(o.created_at) AS last_order_at
        FROM customers c
        LEFT JOIN orders o ON o.customer_id = c.id
        WHERE c.store_id = ${storeId}
          AND (
            c.email ILIKE ${searchPattern}
            OR c.first_name ILIKE ${searchPattern}
            OR c.last_name ILIKE ${searchPattern}
          )
        GROUP BY c.id
        ${orderSql}
        LIMIT ${limit} OFFSET ${offset}
      `,
      prisma.$queryRaw<[{ count: string }]>`
        SELECT COUNT(*)::text AS count
        FROM customers
        WHERE store_id = ${storeId}
          AND (
            email ILIKE ${searchPattern}
            OR first_name ILIKE ${searchPattern}
            OR last_name ILIKE ${searchPattern}
          )
      `,
    ])

    return {
      data: rows.map((r) => toCustomerWithStats(r, quantiles)),
      total: parseInt(countRows[0].count, 10),
      page,
      limit,
    }
  }

  async findById(id: string, storeId: string): Promise<CustomerDetail | null> {
    const customer = await prisma.customer.findFirst({
      where: { id, storeId },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          include: { items: true },
        },
      },
    })

    if (!customer) return null

    const paidOrders = customer.orders.filter((o) => o.paymentStatus === 'paid')
    const ltv = Math.round(paidOrders.reduce((sum, o) => sum + Number(o.total), 0) * 100) / 100
    const lastOrderAt = customer.orders[0]?.createdAt ?? null
    const orderCount = customer.orders.length
    const quantiles = await getStoreLtvQuantiles(storeId)

    return {
      id: customer.id,
      storeId: customer.storeId,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
      orderCount,
      ltv,
      lastOrderAt,
      rfm: calculateRFMScore({ orderCount, ltv, lastOrderAt }, quantiles),
      orders: customer.orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        paymentStatus: o.paymentStatus,
        fulfillmentStatus: o.fulfillmentStatus,
        currency: o.currency,
        total: Number(o.total),
        createdAt: o.createdAt,
        items: o.items.map((i) => ({
          id: i.id,
          title: i.title,
          quantity: i.quantity,
          unitPrice: Number(i.unitPrice),
          total: Number(i.total),
        })),
      })),
    }
  }
}
