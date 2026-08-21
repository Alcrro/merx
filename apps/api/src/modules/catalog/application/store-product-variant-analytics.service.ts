import { prisma } from '../../../lib/prisma'
import type { PeriodStats } from './store-product-analytics.service'

export interface StoreProductVariantAnalytics {
  variantTitle: string
  sku: string
  effectivePrice: number
  totals: PeriodStats
  last7d: PeriodStats
  last14d: PeriodStats
  last30d: PeriodStats
  monthlySales: { month: string; revenue: number; unitsSold: number }[]
  geo: {
    alltime: { cities: { name: string; orders: number }[]; countries: { name: string; orders: number }[] }
    last7d: { cities: { name: string; orders: number }[]; countries: { name: string; orders: number }[] }
    last14d: { cities: { name: string; orders: number }[]; countries: { name: string; orders: number }[] }
    last30d: { cities: { name: string; orders: number }[]; countries: { name: string; orders: number }[] }
  }
  buyers: {
    alltime: { total: number; repeatBuyers: number; repeatRate: number; avgBuyerLtv: number }
    last7d: { total: number; repeatBuyers: number; repeatRate: number; avgBuyerLtv: number }
    last14d: { total: number; repeatBuyers: number; repeatRate: number; avgBuyerLtv: number }
    last30d: { total: number; repeatBuyers: number; repeatRate: number; avgBuyerLtv: number }
  }
  frequentlyBoughtWith: { storeProductId: string; catalogProductId: string; title: string; coOrders: number }[]
}

function round2(n: number) {
  return Math.round(n * 100) / 100
}

function fillMonths(map: Map<string, { revenue: number; unitsSold: number }>) {
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

export async function getStoreProductVariantAnalytics(
  storeProductId: string,
  catalogVariantId: string,
  storeId: string
): Promise<StoreProductVariantAnalytics> {
  const sp = await prisma.storeProduct.findUnique({
    where: { id: storeProductId },
    include: {
      catalogProduct: true,
      variants: {
        where: { catalogVariantId },
        include: { catalogVariant: true },
      },
    },
  })

  if (!sp || sp.storeId !== storeId || sp.variants.length === 0) {
    return emptyAnalytics()
  }

  const spv = sp.variants[0]
  const catalogTitle = sp.catalogProduct?.title ?? ''
  const variantTitle = spv.catalogVariant?.title ?? ''
  const fullTitle = `${catalogTitle} — ${variantTitle}`

  // ── 1. All orders containing this exact variant ──────────────────────────────
  const matchingOrders = await prisma.order.findMany({
    where: {
      storeId,
      items: { some: { title: fullTitle } },
    },
    include: {
      items: { where: { title: fullTitle } },
    },
  })

  const now = new Date()
  const daysAgo = (d: number) => { const t = new Date(now); t.setDate(t.getDate() - d); return t }
  const sevenDaysAgo = daysAgo(7)
  const fourteenDaysAgo = daysAgo(14)
  const thirtyDaysAgo = daysAgo(30)

  type OrderRow = (typeof matchingOrders)[0]

  const ordersLast7d = matchingOrders.filter((o) => o.createdAt >= sevenDaysAgo)
  const ordersLast14d = matchingOrders.filter((o) => o.createdAt >= fourteenDaysAgo)
  const ordersLast30d = matchingOrders.filter((o) => o.createdAt >= thirtyDaysAgo)

  // ── 2. Period stats ──────────────────────────────────────────────────────────
  function periodStats(orders: OrderRow[]): PeriodStats {
    const items = orders.flatMap((o) => o.items)
    return {
      revenue: round2(items.reduce((s, i) => s + Number(i.total), 0)),
      unitsSold: items.reduce((s, i) => s + i.quantity, 0),
      orders: orders.length,
    }
  }

  const totals = periodStats(matchingOrders)
  const last7d = periodStats(ordersLast7d)
  const last14d = periodStats(ordersLast14d)
  const last30d = periodStats(ordersLast30d)

  // ── 3. Monthly (last 12 months) ──────────────────────────────────────────────
  const monthlyMap = new Map<string, { revenue: number; unitsSold: number }>()
  const cutoff = new Date()
  cutoff.setMonth(cutoff.getMonth() - 12)

  for (const o of matchingOrders) {
    if (o.createdAt < cutoff) continue
    const key = o.createdAt.toISOString().slice(0, 7)
    const items = o.items
    const cur = monthlyMap.get(key) ?? { revenue: 0, unitsSold: 0 }
    monthlyMap.set(key, {
      revenue: round2(cur.revenue + items.reduce((s, i) => s + Number(i.total), 0)),
      unitsSold: cur.unitsSold + items.reduce((s, i) => s + i.quantity, 0),
    })
  }
  const monthlySales = fillMonths(monthlyMap)

  // ── 4. Geo per interval ──────────────────────────────────────────────────────
  function computeGeo(orders: OrderRow[]) {
    const cityCount = new Map<string, number>()
    const countryCount = new Map<string, number>()
    for (const o of orders) {
      const addr = o.shippingAddress as Record<string, string> | null
      if (addr?.city) cityCount.set(addr.city, (cityCount.get(addr.city) ?? 0) + 1)
      if (addr?.country) countryCount.set(addr.country, (countryCount.get(addr.country) ?? 0) + 1)
    }
    return {
      cities: [...cityCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, orders]) => ({ name, orders })),
      countries: [...countryCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, orders]) => ({ name, orders })),
    }
  }

  const geo = {
    alltime: computeGeo(matchingOrders),
    last7d: computeGeo(ordersLast7d),
    last14d: computeGeo(ordersLast14d),
    last30d: computeGeo(ordersLast30d),
  }

  // ── 5. Buyers per interval ───────────────────────────────────────────────────
  const allCustomerIds = [...new Set(matchingOrders.flatMap((o) => (o.customerId ? [o.customerId] : [])))]
  const ltvMap = new Map<string, number>()
  if (allCustomerIds.length > 0) {
    const ltvRows = await prisma.order.groupBy({
      by: ['customerId'],
      where: { storeId, customerId: { in: allCustomerIds }, paymentStatus: 'paid' },
      _sum: { total: true },
    })
    for (const r of ltvRows) {
      if (r.customerId) ltvMap.set(r.customerId, Number(r._sum.total ?? 0))
    }
  }

  function computeBuyers(orders: OrderRow[]) {
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

  const buyers = {
    alltime: computeBuyers(matchingOrders),
    last7d: computeBuyers(ordersLast7d),
    last14d: computeBuyers(ordersLast14d),
    last30d: computeBuyers(ordersLast30d),
  }

  // ── 6. Frequently bought together ───────────────────────────────────────────
  const matchingOrderIds = new Set(matchingOrders.map((o) => o.id))

  const otherItems = await prisma.orderItem.findMany({
    where: {
      orderId: { in: [...matchingOrderIds] },
      NOT: { title: fullTitle },
    },
    select: { title: true, orderId: true },
  })

  const otherStoreProducts = await prisma.storeProduct.findMany({
    where: { storeId, NOT: { catalogProductId: sp.catalogProductId } },
    include: { catalogProduct: { select: { id: true, title: true } } },
  })

  const coMap = new Map<string, { storeProductId: string; catalogProductId: string; title: string; orderIds: Set<string> }>()
  for (const item of otherItems) {
    for (const osp of otherStoreProducts) {
      const cpTitle = osp.catalogProduct?.title
      if (!cpTitle) continue
      if (item.title.startsWith(`${cpTitle} — `) || item.title === cpTitle) {
        const key = osp.catalogProductId
        if (!coMap.has(key)) {
          coMap.set(key, { storeProductId: osp.id, catalogProductId: key, title: cpTitle, orderIds: new Set() })
        }
        coMap.get(key)!.orderIds.add(item.orderId)
      }
    }
  }

  const frequentlyBoughtWith = [...coMap.values()]
    .map((v) => ({ storeProductId: v.storeProductId, catalogProductId: v.catalogProductId, title: v.title, coOrders: v.orderIds.size }))
    .sort((a, b) => b.coOrders - a.coOrders)
    .slice(0, 5)

  return {
    variantTitle,
    sku: spv.catalogVariant?.sku ?? '',
    effectivePrice: Number(spv.customPrice ?? spv.catalogVariant?.suggestedPrice ?? 0),
    totals, last7d, last14d, last30d,
    monthlySales, geo, buyers, frequentlyBoughtWith,
  }
}

function emptyAnalytics(): StoreProductVariantAnalytics {
  const emptyPeriod = { revenue: 0, unitsSold: 0, orders: 0 }
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
