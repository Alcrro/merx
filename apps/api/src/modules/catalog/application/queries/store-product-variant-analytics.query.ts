import type { IAnalyticsRepository } from '../../domain/ports'
import type { StoreProductVariantAnalytics, PeriodStats } from '../ports'
import {
  round2,
  daysAgo,
  fillMonths,
  computeGeo,
  computeBuyers,
} from './analytics.utils'

export type { StoreProductVariantAnalytics }

export class StoreProductVariantAnalyticsQuery {
  constructor(private readonly repo: IAnalyticsRepository) {}

  async getAnalytics(
    storeProductId: string,
    catalogVariantId: string,
    storeId: string
  ): Promise<StoreProductVariantAnalytics> {
    const ctx = await this.repo.findStoreProductVariantContext(storeProductId, storeId, catalogVariantId)
    if (!ctx || ctx.variants.length === 0) return emptyAnalytics()

    const variant = ctx.variants[0]
    const fullTitle = `${ctx.catalogProductTitle} — ${variant.variantTitle}`
    const allOrders = await this.repo.findOrdersByExactTitle(storeId, fullTitle)

    const now = new Date()
    const sevenDaysAgo = daysAgo(now, 7)
    const fourteenDaysAgo = daysAgo(now, 14)
    const thirtyDaysAgo = daysAgo(now, 30)

    const ordersLast7d = allOrders.filter((o) => o.createdAt >= sevenDaysAgo)
    const ordersLast14d = allOrders.filter((o) => o.createdAt >= fourteenDaysAgo)
    const ordersLast30d = allOrders.filter((o) => o.createdAt >= thirtyDaysAgo)

    const periodStats = (orders: typeof allOrders): PeriodStats => {
      const items = orders.flatMap((o) => o.items)
      return {
        revenue: round2(items.reduce((s, i) => s + i.total, 0)),
        unitsSold: items.reduce((s, i) => s + i.quantity, 0),
        orders: orders.length,
      }
    }

    const totals = periodStats(allOrders)
    const last7d = periodStats(ordersLast7d)
    const last14d = periodStats(ordersLast14d)
    const last30d = periodStats(ordersLast30d)

    // Monthly
    const monthlyMap = new Map<string, { revenue: number; unitsSold: number }>()
    const cutoff = new Date()
    cutoff.setMonth(cutoff.getMonth() - 12)

    for (const o of allOrders) {
      if (o.createdAt < cutoff) continue
      const key = o.createdAt.toISOString().slice(0, 7)
      const items = o.items
      const cur = monthlyMap.get(key) ?? { revenue: 0, unitsSold: 0 }
      monthlyMap.set(key, {
        revenue: round2(cur.revenue + items.reduce((s, i) => s + i.total, 0)),
        unitsSold: cur.unitsSold + items.reduce((s, i) => s + i.quantity, 0),
      })
    }
    const monthlySales = fillMonths(monthlyMap)

    const geo = {
      alltime: computeGeo(allOrders),
      last7d: computeGeo(ordersLast7d),
      last14d: computeGeo(ordersLast14d),
      last30d: computeGeo(ordersLast30d),
    }

    // Buyers + LTV
    const allCustomerIds = [...new Set(allOrders.flatMap((o) => (o.customerId ? [o.customerId] : [])))]
    const ltvRows = allCustomerIds.length > 0
      ? await this.repo.findCustomerLtv(storeId, allCustomerIds)
      : []
    const ltvMap = new Map(ltvRows.map((r) => [r.customerId, r.ltv]))

    const buyers = {
      alltime: computeBuyers(allOrders, ltvMap),
      last7d: computeBuyers(ordersLast7d, ltvMap),
      last14d: computeBuyers(ordersLast14d, ltvMap),
      last30d: computeBuyers(ordersLast30d, ltvMap),
    }

    // Frequently bought together
    const orderIds = allOrders.map((o) => o.id)
    const otherItems = orderIds.length > 0
      ? await this.repo.findOtherItemsInOrdersByTitle(orderIds, fullTitle)
      : []
    const coProducts = await this.repo.findCoProducts(storeId, ctx.catalogProductId)

    const coMap = new Map<string, { storeProductId: string; catalogProductId: string; title: string; orderIds: Set<string> }>()
    for (const item of otherItems) {
      for (const cp of coProducts) {
        if (item.title.startsWith(`${cp.title} — `) || item.title === cp.title) {
          if (!coMap.has(cp.catalogProductId)) {
            coMap.set(cp.catalogProductId, { storeProductId: cp.storeProductId, catalogProductId: cp.catalogProductId, title: cp.title, orderIds: new Set() })
          }
          coMap.get(cp.catalogProductId)!.orderIds.add(item.orderId)
        }
      }
    }

    const frequentlyBoughtWith = [...coMap.values()]
      .map((v) => ({ storeProductId: v.storeProductId, catalogProductId: v.catalogProductId, title: v.title, coOrders: v.orderIds.size }))
      .sort((a, b) => b.coOrders - a.coOrders)
      .slice(0, 5)

    return {
      variantTitle: variant.variantTitle,
      sku: variant.sku,
      effectivePrice: variant.customPrice ?? variant.suggestedPrice,
      totals, last7d, last14d, last30d,
      monthlySales, geo, buyers, frequentlyBoughtWith,
    }
  }
}

function emptyAnalytics(): StoreProductVariantAnalytics {
  const emptyPeriod: PeriodStats = { revenue: 0, unitsSold: 0, orders: 0 }
  const emptyGeo = { cities: [], countries: [] }
  const emptyBuyers = { total: 0, repeatBuyers: 0, repeatRate: 0, avgBuyerLtv: 0 }
  return {
    variantTitle: '',
    sku: '',
    effectivePrice: 0,
    totals: emptyPeriod,
    last7d: emptyPeriod,
    last14d: emptyPeriod,
    last30d: emptyPeriod,
    monthlySales: [],
    geo: { alltime: emptyGeo, last7d: emptyGeo, last14d: emptyGeo, last30d: emptyGeo },
    buyers: { alltime: emptyBuyers, last7d: emptyBuyers, last14d: emptyBuyers, last30d: emptyBuyers },
    frequentlyBoughtWith: [],
  }
}
