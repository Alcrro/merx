import { prisma } from '../../../../lib/prisma'
import type { Tool } from '@merx/llm-provider'

export const analyticsTools: Tool[] = [
  {
    name: 'get_analytics_overview',
    description:
      'Get revenue, cost, profit, order count, and average order value for the store over the last N days. Also returns percent change vs the previous period.',
    parameters: {
      type: 'object',
      properties: {
        days: {
          type: 'number',
          description: 'Number of days to analyze (e.g. 7, 30, 90). Defaults to 30.',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_top_products',
    description: 'Get the top 10 best-selling products by revenue or units sold over the last N days.',
    parameters: {
      type: 'object',
      properties: {
        days: { type: 'number', description: 'Number of days to analyze. Defaults to 30.' },
        by: {
          type: 'string',
          enum: ['revenue', 'units'],
          description: 'Sort by revenue or units sold. Defaults to revenue.',
        },
      },
      required: [],
    },
  },
]

interface RawMetrics {
  revenue: string
  cost: string
  orders: string
}

async function queryMetrics(storeId: string, startDate: Date, endDate: Date): Promise<RawMetrics> {
  const rows = await prisma.$queryRaw<RawMetrics[]>`
    WITH order_totals AS (
      SELECT COALESCE(SUM(total), 0) AS revenue, COUNT(*) AS orders
      FROM orders
      WHERE store_id = ${storeId}
        AND payment_status = 'paid'
        AND created_at >= ${startDate}
        AND created_at < ${endDate}
    ),
    cost_totals AS (
      SELECT COALESCE(SUM(oi.quantity * COALESCE(pv.cost, 0.0)), 0) AS cost
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      LEFT JOIN product_variants pv ON oi.variant_id = pv.id
      WHERE o.store_id = ${storeId}
        AND o.payment_status = 'paid'
        AND o.created_at >= ${startDate}
        AND o.created_at < ${endDate}
    )
    SELECT ot.revenue::text, ct.cost::text, ot.orders::text
    FROM order_totals ot, cost_totals ct
  `
  return rows[0] ?? { revenue: '0', cost: '0', orders: '0' }
}

function pct(cur: number, prev: number): number {
  if (prev === 0) return cur > 0 ? 100 : 0
  return Math.round(((cur - prev) / prev) * 100 * 10) / 10
}

export async function executeGetAnalyticsOverview(
  storeId: string,
  args: Record<string, unknown>
): Promise<unknown> {
  const days = typeof args.days === 'number' ? args.days : 30
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  startDate.setHours(0, 0, 0, 0)

  const periodMs = endDate.getTime() - startDate.getTime()
  const prevEnd = new Date(startDate)
  const prevStart = new Date(startDate.getTime() - periodMs)

  const [current, previous] = await Promise.all([
    queryMetrics(storeId, startDate, endDate),
    queryMetrics(storeId, prevStart, prevEnd),
  ])

  const revenue = parseFloat(current.revenue)
  const cost = parseFloat(current.cost)
  const profit = revenue - cost
  const orders = parseInt(current.orders, 10)
  const aov = orders > 0 ? revenue / orders : 0

  const prevRevenue = parseFloat(previous.revenue)
  const prevCost = parseFloat(previous.cost)
  const prevProfit = prevRevenue - prevCost
  const prevOrders = parseInt(previous.orders, 10)
  const prevAov = prevOrders > 0 ? prevRevenue / prevOrders : 0

  return {
    period: `last ${days} days`,
    revenue: Math.round(revenue * 100) / 100,
    cost: Math.round(cost * 100) / 100,
    profit: Math.round(profit * 100) / 100,
    orders,
    aov: Math.round(aov * 100) / 100,
    revenueChange: pct(revenue, prevRevenue),
    ordersChange: pct(orders, prevOrders),
    profitChange: pct(profit, prevProfit),
    aovChange: pct(aov, prevAov),
  }
}

interface RawTopProduct {
  product_id: string
  product_title: string
  units_sold: string
  revenue: string
  cost: string
  orders: string
}

async function queryTopByRevenue(storeId: string, startDate: Date, endDate: Date): Promise<RawTopProduct[]> {
  return prisma.$queryRaw<RawTopProduct[]>`
    SELECT
      p.id AS product_id,
      p.title AS product_title,
      COALESCE(SUM(oi.quantity), 0)::text AS units_sold,
      COALESCE(SUM(oi.total), 0)::text AS revenue,
      COALESCE(SUM(oi.quantity * COALESCE(pv.cost, 0.0)), 0)::text AS cost,
      COUNT(DISTINCT o.id)::text AS orders
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    LEFT JOIN product_variants pv ON oi.variant_id = pv.id
    LEFT JOIN products p ON pv.product_id = p.id
    WHERE o.store_id = ${storeId}
      AND o.payment_status = 'paid'
      AND o.created_at >= ${startDate}
      AND o.created_at < ${endDate}
      AND p.id IS NOT NULL
    GROUP BY p.id, p.title
    ORDER BY SUM(oi.total) DESC
    LIMIT 10
  `
}

async function queryTopByUnits(storeId: string, startDate: Date, endDate: Date): Promise<RawTopProduct[]> {
  return prisma.$queryRaw<RawTopProduct[]>`
    SELECT
      p.id AS product_id,
      p.title AS product_title,
      COALESCE(SUM(oi.quantity), 0)::text AS units_sold,
      COALESCE(SUM(oi.total), 0)::text AS revenue,
      COALESCE(SUM(oi.quantity * COALESCE(pv.cost, 0.0)), 0)::text AS cost,
      COUNT(DISTINCT o.id)::text AS orders
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    LEFT JOIN product_variants pv ON oi.variant_id = pv.id
    LEFT JOIN products p ON pv.product_id = p.id
    WHERE o.store_id = ${storeId}
      AND o.payment_status = 'paid'
      AND o.created_at >= ${startDate}
      AND o.created_at < ${endDate}
      AND p.id IS NOT NULL
    GROUP BY p.id, p.title
    ORDER BY SUM(oi.quantity) DESC
    LIMIT 10
  `
}

export async function executeGetTopProducts(
  storeId: string,
  args: Record<string, unknown>
): Promise<unknown> {
  const days = typeof args.days === 'number' ? args.days : 30
  const by = args.by === 'units' ? 'units' : 'revenue'

  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  startDate.setHours(0, 0, 0, 0)

  const rows = by === 'units'
    ? await queryTopByUnits(storeId, startDate, endDate)
    : await queryTopByRevenue(storeId, startDate, endDate)

  return {
    period: `last ${days} days`,
    sortedBy: by,
    products: rows.map((r) => ({
      productId: r.product_id,
      title: r.product_title,
      unitsSold: parseInt(r.units_sold, 10),
      revenue: Math.round(parseFloat(r.revenue) * 100) / 100,
      profit: Math.round((parseFloat(r.revenue) - parseFloat(r.cost)) * 100) / 100,
      orders: parseInt(r.orders, 10),
    })),
  }
}
