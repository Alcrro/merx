import { prisma } from '../../../lib/prisma'
import type { IAnalyticsRepository } from '../domain/ports'
import type { AnalyticsOverview, RevenueChartPoint, TopProduct } from '../domain/entities'

interface RawMetricsRow {
  revenue: string
  cost: string
  orders: string
}

interface RawChartRow {
  date: Date
  revenue: string
}

interface RawTopProductRow {
  product_id: string
  product_title: string
  units_sold: string
  revenue: string
  cost: string
  orders: string
}

function pctChange(current: number, prev: number): number {
  if (prev === 0) return current > 0 ? 100 : 0
  return ((current - prev) / prev) * 100
}

async function queryMetrics(storeId: string, startDate: Date, endDate: Date): Promise<RawMetricsRow> {
  const rows = await prisma.$queryRaw<RawMetricsRow[]>`
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

export class AnalyticsRepository implements IAnalyticsRepository {
  async getOverview(storeId: string, startDate: Date, endDate: Date): Promise<AnalyticsOverview> {
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
      revenue, cost, profit, orders, aov,
      revenueChange: pctChange(revenue, prevRevenue),
      ordersChange: pctChange(orders, prevOrders),
      profitChange: pctChange(profit, prevProfit),
      aovChange: pctChange(aov, prevAov),
    }
  }

  async getRevenueChart(storeId: string, startDate: Date, endDate: Date): Promise<RevenueChartPoint[]> {
    const rows = await prisma.$queryRaw<RawChartRow[]>`
      SELECT
        date_trunc('day', created_at)::date AS date,
        COALESCE(SUM(total), 0)::text AS revenue
      FROM orders
      WHERE store_id = ${storeId}
        AND payment_status = 'paid'
        AND created_at >= ${startDate}
        AND created_at < ${endDate}
      GROUP BY date_trunc('day', created_at)::date
      ORDER BY date ASC
    `
    return rows.map((r) => ({
      date: r.date.toISOString().split('T')[0] ?? '',
      revenue: parseFloat(r.revenue),
    }))
  }

  async getTopProducts(storeId: string, startDate: Date, endDate: Date, by: 'revenue' | 'units'): Promise<TopProduct[]> {
    const orderCol = by === 'units' ? 'SUM(oi.quantity)' : 'SUM(oi.total)'
    const rows = await prisma.$queryRaw<RawTopProductRow[]>`
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
      ORDER BY ${orderCol} DESC
      LIMIT 10
    `
    return rows.map((r) => ({
      productId: r.product_id,
      productTitle: r.product_title,
      unitsSold: parseInt(r.units_sold, 10),
      revenue: parseFloat(r.revenue),
      profit: parseFloat(r.revenue) - parseFloat(r.cost),
      orders: parseInt(r.orders, 10),
    }))
  }

  async recalculateDay(date: Date): Promise<number> {
    const dayStart = new Date(date)
    dayStart.setUTCHours(0, 0, 0, 0)
    const dayEnd = new Date(date)
    dayEnd.setUTCHours(23, 59, 59, 999)

    const stores = await prisma.store.findMany({ select: { id: true } })

    for (const store of stores) {
      await this.recalculateStoreDay(store.id, dayStart, dayEnd)
    }

    return stores.length
  }

  private async recalculateStoreDay(storeId: string, dayStart: Date, dayEnd: Date): Promise<void> {
    const orders = await prisma.order.findMany({
      where: { storeId, paymentStatus: 'paid', createdAt: { gte: dayStart, lte: dayEnd } },
      include: {
        items: {
          include: {
            variant: { select: { cost: true, product: { select: { id: true, title: true } } } },
          },
        },
      },
    })

    let revenue = 0
    let cost = 0
    const productMap = new Map<string, { title: string; unitsSold: number; revenue: number; cost: number; orderIds: Set<string> }>()

    for (const order of orders) {
      revenue += Number(order.total)
      for (const item of order.items) {
        const itemCost = item.quantity * Number(item.variant?.cost ?? 0)
        cost += itemCost
        const product = item.variant?.product
        if (product) {
          const entry = productMap.get(product.id) ?? { title: product.title, unitsSold: 0, revenue: 0, cost: 0, orderIds: new Set() }
          entry.unitsSold += item.quantity
          entry.revenue += Number(item.total)
          entry.cost += itemCost
          entry.orderIds.add(order.id)
          productMap.set(product.id, entry)
        }
      }
    }

    const orderCount = orders.length
    const profit = revenue - cost
    const aov = orderCount > 0 ? revenue / orderCount : 0

    await prisma.dailyStoreMetrics.upsert({
      where: { date_storeId: { date: dayStart, storeId } },
      update: { revenue, cost, profit, orders: orderCount, aov },
      create: { date: dayStart, storeId, revenue, cost, profit, orders: orderCount, aov },
    })

    for (const [productId, m] of productMap) {
      await prisma.dailyProductMetrics.upsert({
        where: { date_storeId_productId: { date: dayStart, storeId, productId } },
        update: { unitsSold: m.unitsSold, revenue: m.revenue, cost: m.cost, profit: m.revenue - m.cost, orders: m.orderIds.size },
        create: { date: dayStart, storeId, productId, unitsSold: m.unitsSold, revenue: m.revenue, cost: m.cost, profit: m.revenue - m.cost, orders: m.orderIds.size },
      })
    }
  }
}

export const analyticsRepository = new AnalyticsRepository()
