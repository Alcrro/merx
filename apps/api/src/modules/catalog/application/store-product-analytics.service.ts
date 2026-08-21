import { prisma } from '../../../lib/prisma'

export interface PeriodStats {
  revenue: number
  unitsSold: number
  orders: number
}

export interface VariantStat {
  catalogVariantId: string
  title: string
  sku: string
  effectivePrice: number
  unitsSold: number
  revenue: number
  topCity: string | null
  topCityOrders: number
  topCountry: string | null
  topCountryOrders: number
}

export interface StoreProductAnalytics {
  totals: PeriodStats
  last7d: PeriodStats
  last14d: PeriodStats
  last30d: PeriodStats
  monthlySales: { month: string; revenue: number; unitsSold: number }[]
  variantStats: {
    alltime: VariantStat[]
    last7d: VariantStat[]
    last14d: VariantStat[]
    last30d: VariantStat[]
  }
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
  frequentlyBoughtWith: {
    storeProductId: string
    catalogProductId: string
    title: string
    coOrders: number
  }[]
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

export async function getStoreProductAnalytics(
  storeProductId: string,
  storeId: string
): Promise<StoreProductAnalytics> {
  // ── 1. Resolve storeProduct → catalogProduct + variants ──────────────────────
  const sp = await prisma.storeProduct.findUnique({
    where: { id: storeProductId },
    include: {
      catalogProduct: true,
      variants: { include: { catalogVariant: true } },
    },
  })

  if (!sp || sp.storeId !== storeId) {
    return emptyAnalytics()
  }

  const catalogTitle = sp.catalogProduct?.title ?? ''
  const titlePrefix = `${catalogTitle} — `

  // ── 2. All matching orders + items ──────────────────────────────────────────
  const matchingOrders = await prisma.order.findMany({
    where: {
      storeId,
      items: { some: { title: { startsWith: titlePrefix } } },
    },
    include: {
      items: { where: { title: { startsWith: titlePrefix } } },
    },
  })

  const now = new Date()
  const daysAgo = (d: number) => { const t = new Date(now); t.setDate(t.getDate() - d); return t }
  const sevenDaysAgo = daysAgo(7)
  const fourteenDaysAgo = daysAgo(14)
  const thirtyDaysAgo = daysAgo(30)

  // ── 3. Totals ────────────────────────────────────────────────────────────────
  const allItems = matchingOrders.flatMap((o) => o.items.map((i) => ({ ...i, order: o })))

  function periodStats(items: typeof allItems): PeriodStats {
    const orderIds = new Set(items.map((i) => i.orderId))
    return {
      revenue: round2(items.reduce((s, i) => s + Number(i.total), 0)),
      unitsSold: items.reduce((s, i) => s + i.quantity, 0),
      orders: orderIds.size,
    }
  }

  const totals = periodStats(allItems)
  const last7d = periodStats(allItems.filter((i) => i.order.createdAt >= sevenDaysAgo))
  const last14d = periodStats(allItems.filter((i) => i.order.createdAt >= fourteenDaysAgo))
  const last30d = periodStats(allItems.filter((i) => i.order.createdAt >= thirtyDaysAgo))

  // ── 4. Monthly (last 12 months) ──────────────────────────────────────────────
  const monthlyMap = new Map<string, { revenue: number; unitsSold: number }>()
  const cutoff = new Date()
  cutoff.setMonth(cutoff.getMonth() - 12)

  for (const item of allItems) {
    if (item.order.createdAt < cutoff) continue
    const key = item.order.createdAt.toISOString().slice(0, 7)
    const cur = monthlyMap.get(key) ?? { revenue: 0, unitsSold: 0 }
    monthlyMap.set(key, {
      revenue: round2(cur.revenue + Number(item.total)),
      unitsSold: cur.unitsSold + item.quantity,
    })
  }
  const monthlySales = fillMonths(monthlyMap)

  // ── 5. Variant stats per interval ───────────────────────────────────────────
  type OrderRow = (typeof matchingOrders)[0]
  type ItemRow = (typeof allItems)[0]

  function computeVariantStats(items: ItemRow[], orders: OrderRow[]): VariantStat[] {
    return sp!.variants.map((v) => {
      const vTitle = v.catalogVariant?.title ?? ''
      const fullTitle = `${catalogTitle} — ${vTitle}`
      const vItems = items.filter((i) => i.title === fullTitle)
      const vOrders = orders.filter((o) => o.items.some((i) => i.title === fullTitle))

      const cityCount = new Map<string, number>()
      const countryCount = new Map<string, number>()
      for (const o of vOrders) {
        const addr = o.shippingAddress as Record<string, string> | null
        if (addr?.city) cityCount.set(addr.city, (cityCount.get(addr.city) ?? 0) + 1)
        if (addr?.country) countryCount.set(addr.country, (countryCount.get(addr.country) ?? 0) + 1)
      }
      const topCityEntry = [...cityCount.entries()].sort((a, b) => b[1] - a[1])[0]
      const topCountryEntry = [...countryCount.entries()].sort((a, b) => b[1] - a[1])[0]

      return {
        catalogVariantId: v.catalogVariantId,
        title: vTitle,
        sku: v.catalogVariant?.sku ?? '',
        effectivePrice: Number(v.customPrice ?? v.catalogVariant?.suggestedPrice ?? 0),
        unitsSold: vItems.reduce((s, i) => s + i.quantity, 0),
        revenue: round2(vItems.reduce((s, i) => s + Number(i.total), 0)),
        topCity: topCityEntry?.[0] ?? null,
        topCityOrders: topCityEntry?.[1] ?? 0,
        topCountry: topCountryEntry?.[0] ?? null,
        topCountryOrders: topCountryEntry?.[1] ?? 0,
      }
    })
  }

  const ordersLast7d = matchingOrders.filter((o) => o.createdAt >= sevenDaysAgo)
  const ordersLast14d = matchingOrders.filter((o) => o.createdAt >= fourteenDaysAgo)
  const ordersLast30d = matchingOrders.filter((o) => o.createdAt >= thirtyDaysAgo)

  const variantStats = {
    alltime: computeVariantStats(allItems, matchingOrders),
    last7d: computeVariantStats(allItems.filter((i) => i.order.createdAt >= sevenDaysAgo), ordersLast7d),
    last14d: computeVariantStats(allItems.filter((i) => i.order.createdAt >= fourteenDaysAgo), ordersLast14d),
    last30d: computeVariantStats(allItems.filter((i) => i.order.createdAt >= thirtyDaysAgo), ordersLast30d),
  }

  // ── 6. Geo per interval ──────────────────────────────────────────────────────
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

  // ── 7. Buyers per interval ───────────────────────────────────────────────────
  // LTV: un singur query Prisma pentru toți clienții unici (all-time superset)
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

  // ── 8. Frequently bought together ───────────────────────────────────────────
  const matchingOrderIds = new Set(matchingOrders.map((o) => o.id))

  const otherItems = await prisma.orderItem.findMany({
    where: {
      orderId: { in: [...matchingOrderIds] },
      NOT: { title: { startsWith: titlePrefix } },
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

  return { totals, last7d, last14d, last30d, monthlySales, variantStats, geo, buyers, frequentlyBoughtWith }
}

function emptyAnalytics(): StoreProductAnalytics {
  return {
    totals: { revenue: 0, unitsSold: 0, orders: 0 },
    last7d: { revenue: 0, unitsSold: 0, orders: 0 },
    last14d: { revenue: 0, unitsSold: 0, orders: 0 },
    last30d: { revenue: 0, unitsSold: 0, orders: 0 },
    monthlySales: [],
    variantStats: { alltime: [], last7d: [], last14d: [], last30d: [] },
    geo: {
      alltime: { cities: [], countries: [] },
      last7d: { cities: [], countries: [] },
      last14d: { cities: [], countries: [] },
      last30d: { cities: [], countries: [] },
    },
    buyers: {
      alltime: { total: 0, repeatBuyers: 0, repeatRate: 0, avgBuyerLtv: 0 },
      last7d: { total: 0, repeatBuyers: 0, repeatRate: 0, avgBuyerLtv: 0 },
      last14d: { total: 0, repeatBuyers: 0, repeatRate: 0, avgBuyerLtv: 0 },
      last30d: { total: 0, repeatBuyers: 0, repeatRate: 0, avgBuyerLtv: 0 },
    },
    frequentlyBoughtWith: [],
  }
}
