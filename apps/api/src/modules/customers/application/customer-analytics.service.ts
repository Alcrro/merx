import { Prisma } from '@prisma/client'
import { prisma } from '../../../lib/prisma'
import type { CustomerAnalytics } from '@merx/types'

function daysBetween(a: Date, b: Date): number {
  return Math.round(Math.abs(b.getTime() - a.getTime()) / 86_400_000)
}

function buildRiskLevel(
  daysSinceLastOrder: number,
  avgDaysBetweenOrders: number
): 'green' | 'yellow' | 'red' {
  if (daysSinceLastOrder < avgDaysBetweenOrders) return 'green'
  if (daysSinceLastOrder < avgDaysBetweenOrders * 2) return 'yellow'
  return 'red'
}

interface RawMonthlyRow {
  month: string
  total: string
}

interface RawAovRow {
  aov: string
}

interface RawOrderDateRow {
  created_at: Date
}

interface RawTopProductRow {
  product_id: string
  title: string
  order_count: string
  total_spent: string
}

export async function getCustomerAnalytics(
  customerId: string,
  storeId: string
): Promise<CustomerAnalytics> {
  const [monthlyRows, customerAovRow, storeAovRow, orderDates, topProductRows] = await Promise.all([
    prisma.$queryRaw<RawMonthlyRow[]>`
      SELECT
        TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS month,
        COALESCE(SUM(total), 0)::text AS total
      FROM orders
      WHERE customer_id = ${customerId}
        AND store_id = ${storeId}
        AND payment_status = 'paid'
        AND created_at >= NOW() - INTERVAL '12 months'
      GROUP BY 1
      ORDER BY 1
    `,
    prisma.$queryRaw<RawAovRow[]>`
      SELECT COALESCE(AVG(total), 0)::text AS aov
      FROM orders
      WHERE customer_id = ${customerId}
        AND payment_status = 'paid'
    `,
    prisma.$queryRaw<RawAovRow[]>`
      SELECT COALESCE(AVG(total), 0)::text AS aov
      FROM orders
      WHERE store_id = ${storeId}
        AND payment_status = 'paid'
    `,
    prisma.$queryRaw<RawOrderDateRow[]>`
      SELECT created_at
      FROM orders
      WHERE customer_id = ${customerId}
        AND store_id = ${storeId}
        AND payment_status = 'paid'
      ORDER BY created_at ASC
    `,
    prisma.$queryRaw<RawTopProductRow[]>`
      SELECT
        p.id AS product_id,
        p.title,
        COUNT(DISTINCT o.id)::text AS order_count,
        COALESCE(SUM(oi.total), 0)::text AS total_spent
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN product_variants pv ON oi.variant_id = pv.id
      JOIN products p ON pv.product_id = p.id
      WHERE o.customer_id = ${customerId}
        AND o.store_id = ${storeId}
        AND o.payment_status = 'paid'
      GROUP BY p.id, p.title
      ORDER BY order_count DESC, total_spent DESC
      LIMIT 5
    `,
  ])

  // Fill missing months with 0
  const spendByMonth = new Map(monthlyRows.map((r) => [r.month, parseFloat(r.total)]))
  const monthlySpend: { month: string; total: number }[] = []
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthlySpend.push({ month: key, total: Math.round((spendByMonth.get(key) ?? 0) * 100) / 100 })
  }

  const customerAov = parseFloat(customerAovRow[0]?.aov ?? '0')
  const storeAov = parseFloat(storeAovRow[0]?.aov ?? '0')

  // Cadence
  const dates = orderDates.map((r) => new Date(r.created_at))
  let avgDaysBetweenOrders: number | null = null
  let daysSinceLastOrder: number | null = null
  let riskLevel: 'green' | 'yellow' | 'red' | null = null

  if (dates.length >= 1) {
    daysSinceLastOrder = daysBetween(dates[dates.length - 1], new Date())
  }

  if (dates.length >= 2) {
    const gaps = dates.slice(1).map((d, i) => daysBetween(dates[i], d))
    avgDaysBetweenOrders = Math.round(gaps.reduce((s, g) => s + g, 0) / gaps.length)
    riskLevel = buildRiskLevel(daysSinceLastOrder!, avgDaysBetweenOrders)
  }

  return {
    monthlySpend,
    aov: {
      customer: Math.round(customerAov * 100) / 100,
      store: Math.round(storeAov * 100) / 100,
      delta: Math.round((customerAov - storeAov) * 100) / 100,
    },
    cadence: {
      avgDaysBetweenOrders,
      daysSinceLastOrder,
      riskLevel,
    },
    topProducts: topProductRows.map((r) => ({
      productId: r.product_id,
      title: r.title,
      orderCount: parseInt(r.order_count, 10),
      totalSpent: Math.round(parseFloat(r.total_spent) * 100) / 100,
    })),
  }
}
