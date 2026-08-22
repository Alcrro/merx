import type { IAnalyticsRepository } from '../../domain/ports'
import type { AnalyticsOrder } from '../../domain/types'
import type { StoreProductAnalytics, VariantStat, PeriodStats } from '../ports'
import {
  round2,
  daysAgo,
  fillMonths,
  computePeriodStats,
  computeGeo,
  computeBuyers,
} from './analytics.utils'

export type { StoreProductAnalytics, VariantStat }

export class StoreProductAnalyticsQuery {
  constructor(private readonly repo: IAnalyticsRepository) {}

  async getAnalytics(storeProductId: string, storeId: string): Promise<StoreProductAnalytics> {
    const ctx = await this.repo.findStoreProductContext(storeProductId, storeId)
    if (!ctx) return emptyAnalytics()

    const titlePrefix = `${ctx.catalogProductTitle} — `
    const allOrders = await this.repo.findOrdersByTitlePrefix(storeId, titlePrefix)

    const now = new Date()
    const sevenDaysAgo = daysAgo(now, 7)
    const fourteenDaysAgo = daysAgo(now, 14)
    const thirtyDaysAgo = daysAgo(now, 30)

    const ordersLast7d = allOrders.filter((o) => o.createdAt >= sevenDaysAgo)
    const ordersLast14d = allOrders.filter((o) => o.createdAt >= fourteenDaysAgo)
    const ordersLast30d = allOrders.filter((o) => o.createdAt >= thirtyDaysAgo)

    const totals = computePeriodStats(allOrders)
    const last7d = computePeriodStats(ordersLast7d)
    const last14d = computePeriodStats(ordersLast14d)
    const last30d = computePeriodStats(ordersLast30d)

    // Monthly (last 12 months)
    const monthlyMap = new Map<string, { revenue: number; unitsSold: number }>()
    const cutoff = new Date()
    cutoff.setMonth(cutoff.getMonth() - 12)

    for (const o of allOrders) {
      if (o.createdAt < cutoff) continue
      const key = o.createdAt.toISOString().slice(0, 7)
      const cur = monthlyMap.get(key) ?? { revenue: 0, unitsSold: 0 }
      monthlyMap.set(key, {
        revenue: round2(cur.revenue + o.items.reduce((s, i) => s + i.total, 0)),
        unitsSold: cur.unitsSold + o.items.reduce((s, i) => s + i.quantity, 0),
      })
    }
    const monthlySales = fillMonths(monthlyMap)

    // Variant stats
    const computeVariantStats = (orders: AnalyticsOrder[]): VariantStat[] =>
      ctx.variants.map((v) => {
        const fullTitle = `${ctx.catalogProductTitle} — ${v.variantTitle}`
        const vItems = orders.flatMap((o) => o.items.filter((i) => i.title === fullTitle))
        const vOrders = orders.filter((o) => o.items.some((i) => i.title === fullTitle))

        const cityCount = new Map<string, number>()
        const countryCount = new Map<string, number>()
        for (const o of vOrders) {
          const addr = o.shippingAddress
          if (addr?.city) cityCount.set(addr.city, (cityCount.get(addr.city) ?? 0) + 1)
          if (addr?.country) countryCount.set(addr.country, (countryCount.get(addr.country) ?? 0) + 1)
        }
        const topCityEntry = [...cityCount.entries()].sort((a, b) => b[1] - a[1])[0]
        const topCountryEntry = [...countryCount.entries()].sort((a, b) => b[1] - a[1])[0]

        return {
          catalogVariantId: v.catalogVariantId,
          title: v.variantTitle,
          sku: v.sku,
          effectivePrice: v.customPrice ?? v.suggestedPrice,
          unitsSold: vItems.reduce((s, i) => s + i.quantity, 0),
          revenue: round2(vItems.reduce((s, i) => s + i.total, 0)),
          topCity: topCityEntry?.[0] ?? null,
          topCityOrders: topCityEntry?.[1] ?? 0,
          topCountry: topCountryEntry?.[0] ?? null,
          topCountryOrders: topCountryEntry?.[1] ?? 0,
        }
      })

    const variantStats = {
      alltime: computeVariantStats(allOrders),
      last7d: computeVariantStats(ordersLast7d),
      last14d: computeVariantStats(ordersLast14d),
      last30d: computeVariantStats(ordersLast30d),
    }

    // Geo
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
      ? await this.repo.findOtherItemsInOrdersByPrefix(orderIds, titlePrefix)
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

    return { totals, last7d, last14d, last30d, monthlySales, variantStats, geo, buyers, frequentlyBoughtWith }
  }
}

function emptyAnalytics(): StoreProductAnalytics {
  const emptyPeriod: PeriodStats = { revenue: 0, unitsSold: 0, orders: 0 }
  const emptyGeo = { cities: [], countries: [] }
  const emptyBuyers = { total: 0, repeatBuyers: 0, repeatRate: 0, avgBuyerLtv: 0 }
  return {
    totals: emptyPeriod,
    last7d: emptyPeriod,
    last14d: emptyPeriod,
    last30d: emptyPeriod,
    monthlySales: [],
    variantStats: { alltime: [], last7d: [], last14d: [], last30d: [] },
    geo: { alltime: emptyGeo, last7d: emptyGeo, last14d: emptyGeo, last30d: emptyGeo },
    buyers: { alltime: emptyBuyers, last7d: emptyBuyers, last14d: emptyBuyers, last30d: emptyBuyers },
    frequentlyBoughtWith: [],
  }
}
