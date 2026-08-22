import type { AnalyticsOrder, AnalyticsOrderItem } from '../../domain/types'
import type { PeriodStats, GeoStats, BuyerStats } from '../ports'

export type { PeriodStats }

export function round2(n: number): number {
  return Math.round(n * 100) / 100
}

export function daysAgo(now: Date, d: number): Date {
  const t = new Date(now)
  t.setDate(t.getDate() - d)
  return t
}

export function fillMonths(map: Map<string, { revenue: number; unitsSold: number }>): { month: string; revenue: number; unitsSold: number }[] {
  const result = []
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const row = map.get(key) ?? { revenue: 0, unitsSold: 0 }
    result.push({ month: key, revenue: row.revenue, unitsSold: row.unitsSold })
  }
  return result
}

export function computePeriodStats(orders: AnalyticsOrder[]): PeriodStats {
  const items: AnalyticsOrderItem[] = orders.flatMap((o) => o.items)
  const orderIds = new Set(items.map((i) => i.orderId))
  return {
    revenue: round2(items.reduce((s, i) => s + i.total, 0)),
    unitsSold: items.reduce((s, i) => s + i.quantity, 0),
    orders: orderIds.size,
  }
}

export function computeGeo(orders: AnalyticsOrder[]): GeoStats {
  const cityCount = new Map<string, number>()
  const countryCount = new Map<string, number>()
  for (const o of orders) {
    const addr = o.shippingAddress
    if (addr?.city) cityCount.set(addr.city, (cityCount.get(addr.city) ?? 0) + 1)
    if (addr?.country) countryCount.set(addr.country, (countryCount.get(addr.country) ?? 0) + 1)
  }
  return {
    cities: [...cityCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, orders]) => ({ name, orders })),
    countries: [...countryCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, orders]) => ({ name, orders })),
  }
}

export function computeBuyers(
  orders: AnalyticsOrder[],
  ltvMap: Map<string, number>
): BuyerStats {
  const customerOrderMap = new Map<string, number>()
  for (const o of orders) {
    if (!o.customerId) continue
    customerOrderMap.set(o.customerId, (customerOrderMap.get(o.customerId) ?? 0) + 1)
  }
  const ids = [...customerOrderMap.keys()]
  const repeatBuyers = [...customerOrderMap.values()].filter((c) => c >= 2).length
  const totalLtv = ids.reduce((s, id) => s + (ltvMap.get(id) ?? 0), 0)
  return {
    total: ids.length,
    repeatBuyers,
    repeatRate: ids.length > 0 ? round2((repeatBuyers / ids.length) * 100) : 0,
    avgBuyerLtv: ids.length > 0 ? round2(totalLtv / ids.length) : 0,
  }
}
