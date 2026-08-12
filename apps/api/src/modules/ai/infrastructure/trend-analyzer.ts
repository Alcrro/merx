import { prisma } from '../../../lib/prisma'

export interface ProductTrend {
  productId: string
  productTitle: string
  velocityRecent: number   // units/day, last 7 days
  velocityPrev: number     // units/day, previous 7 days
  trendPct: number         // % change in velocity
  totalStock: number       // available units across all variants
  runwayDays: number | null // days until stockout at current velocity (null = not selling)
  recommendedOrder: number  // units to order for 30-day supply
}

export type InsightType = 'trending_low_stock' | 'trending_stockout' | 'slow_overstock'
export type InsightSeverity = 'info' | 'warning' | 'critical'

export interface GeneratedInsight {
  type: InsightType
  severity: InsightSeverity
  title: string
  description: string
  data: ProductTrend
}

interface RawVelocityRow {
  product_id: string
  product_title: string
  units_recent: string
  units_prev: string
}

interface RawStockRow {
  product_id: string
  available: string
}

export async function analyzeStore(storeId: string): Promise<GeneratedInsight[]> {
  const now = new Date()
  const t7 = new Date(now); t7.setDate(t7.getDate() - 7)
  const t14 = new Date(now); t14.setDate(t14.getDate() - 14)

  const [velocityRows, stockRows] = await Promise.all([
    prisma.$queryRaw<RawVelocityRow[]>`
      SELECT
        p.id AS product_id,
        p.title AS product_title,
        COALESCE(SUM(CASE WHEN o.created_at >= ${t7} THEN oi.quantity ELSE 0 END), 0)::text AS units_recent,
        COALESCE(SUM(CASE WHEN o.created_at >= ${t14} AND o.created_at < ${t7} THEN oi.quantity ELSE 0 END), 0)::text AS units_prev
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN product_variants pv ON oi.variant_id = pv.id
      JOIN products p ON pv.product_id = p.id
      WHERE o.store_id = ${storeId}
        AND o.payment_status = 'paid'
        AND o.created_at >= ${t14}
        AND p.status = 'active'
      GROUP BY p.id, p.title
    `,
    prisma.$queryRaw<RawStockRow[]>`
      SELECT
        p.id AS product_id,
        COALESCE(SUM(ii.quantity - ii.reserved_quantity), 0)::text AS available
      FROM inventory_items ii
      JOIN product_variants pv ON ii.variant_id = pv.id
      JOIN products p ON pv.product_id = p.id
      WHERE ii.store_id = ${storeId}
      GROUP BY p.id
    `,
  ])

  const stockMap = new Map(stockRows.map((r) => [r.product_id, Math.max(0, parseInt(r.available, 10))]))

  const trends: ProductTrend[] = velocityRows.map((r) => {
    const unitsRecent = parseInt(r.units_recent, 10)
    const unitsPrev = parseInt(r.units_prev, 10)
    const velocityRecent = unitsRecent / 7
    const velocityPrev = unitsPrev / 7
    const trendPct = velocityPrev === 0
      ? (velocityRecent > 0 ? 100 : 0)
      : ((velocityRecent - velocityPrev) / velocityPrev) * 100

    const totalStock = stockMap.get(r.product_id) ?? 0
    const runwayDays = velocityRecent > 0 ? Math.floor(totalStock / velocityRecent) : null
    const recommendedOrder = Math.max(0, Math.ceil(velocityRecent * 30) - totalStock)

    return {
      productId: r.product_id,
      productTitle: r.product_title,
      velocityRecent: Math.round(velocityRecent * 100) / 100,
      velocityPrev: Math.round(velocityPrev * 100) / 100,
      trendPct: Math.round(trendPct),
      totalStock,
      runwayDays,
      recommendedOrder,
    }
  })

  const insights: GeneratedInsight[] = []

  for (const t of trends) {
    const isTrending = t.trendPct >= 20

    // Trending + stoc epuizat sau < 3 zile
    if (isTrending && (t.totalStock === 0 || (t.runwayDays !== null && t.runwayDays <= 3))) {
      const runway = t.totalStock === 0 ? 'stoc epuizat' : `${t.runwayDays} zile rămase`
      insights.push({
        type: 'trending_stockout',
        severity: 'critical',
        title: `${t.productTitle} — vânzări în creștere, ${runway}`,
        description: `Vânzările au crescut cu ${t.trendPct}% față de săptămâna trecută (${t.velocityRecent.toFixed(1)} unități/zi). ${t.recommendedOrder > 0 ? `Comandă ${t.recommendedOrder} unități pentru aprovizionare 30 zile.` : ''}`,
        data: t,
      })
      continue
    }

    // Trending + runway < 14 zile
    if (isTrending && t.runwayDays !== null && t.runwayDays <= 14) {
      insights.push({
        type: 'trending_low_stock',
        severity: 'warning',
        title: `${t.productTitle} — pe val, stoc pentru ${t.runwayDays} zile`,
        description: `Vânzările au crescut cu ${t.trendPct}% (${t.velocityRecent.toFixed(1)} unități/zi). La viteza actuală, stocul se epuizează în ${t.runwayDays} zile. Comandă ${t.recommendedOrder} unități acum.`,
        data: t,
      })
      continue
    }

    // Vânzările au scăzut mult și stocul e mare
    if (t.trendPct <= -30 && t.runwayDays !== null && t.runwayDays > 60) {
      insights.push({
        type: 'slow_overstock',
        severity: 'info',
        title: `${t.productTitle} — vânzări în scădere, stoc excess`,
        description: `Vânzările au scăzut cu ${Math.abs(t.trendPct)}%. La ritmul actual, stocul ajunge pentru ${t.runwayDays} zile. Consideră o promoție sau reducere de preț.`,
        data: t,
      })
    }
  }

  return insights
}
