import { Prisma } from '@prisma/client'
import { prisma } from '../../../lib/prisma'
import type { ProductAnalytics } from '@merx/types'

interface RawMetrics {
  revenue: string
  profit: string
  units_sold: string
  orders: string
}

interface RawMonthlyRow {
  month: string
  revenue: string
  units_sold: string
}

interface RawVariantRow {
  variant_id: string
  title: string
  sku: string
  price: string
  cost: string | null
  units_sold: string
  revenue: string
  current_stock: string | null
}

interface RawGeoRow {
  name: string
  orders: string
}

interface RawBuyerRow {
  customer_id: string
  purchase_count: string
  ltv: string
}

interface RawCoProductRow {
  product_id: string
  title: string
  co_orders: string
}

interface RawVariantGeoRow {
  variant_id: string
  top_city: string | null
  top_city_orders: string
  top_country: string | null
  top_country_orders: string
}

function fillMonths(rows: RawMonthlyRow[]): { month: string; revenue: number; unitsSold: number }[] {
  const byMonth = new Map(rows.map((r) => [r.month, r]))
  const result = []
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const row = byMonth.get(key)
    result.push({
      month: key,
      revenue: row ? Math.round(parseFloat(row.revenue) * 100) / 100 : 0,
      unitsSold: row ? parseInt(row.units_sold, 10) : 0,
    })
  }
  return result
}

export async function getProductAnalytics(
  productId: string,
  storeId: string
): Promise<ProductAnalytics> {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0]

  const [
    totalsRows,
    last30dRows,
    monthlyRows,
    variantRows,
    cityRows,
    countryRows,
    buyerRows,
    variantGeoRows,
    coProductRows,
  ] = await Promise.all([
    // All-time totals from DailyProductMetrics
    prisma.$queryRaw<RawMetrics[]>`
      SELECT
        COALESCE(SUM(revenue), 0)::text    AS revenue,
        COALESCE(SUM(profit), 0)::text     AS profit,
        COALESCE(SUM(units_sold), 0)::text AS units_sold,
        COALESCE(SUM(orders), 0)::text     AS orders
      FROM daily_product_metrics
      WHERE product_id = ${productId} AND store_id = ${storeId}
    `,

    // Last 30d totals
    prisma.$queryRaw<RawMetrics[]>`
      SELECT
        COALESCE(SUM(revenue), 0)::text    AS revenue,
        COALESCE(SUM(profit), 0)::text     AS profit,
        COALESCE(SUM(units_sold), 0)::text AS units_sold,
        COALESCE(SUM(orders), 0)::text     AS orders
      FROM daily_product_metrics
      WHERE product_id = ${productId}
        AND store_id = ${storeId}
        AND date >= ${thirtyDaysAgoStr}::date
    `,

    // Monthly sales — last 12 months
    prisma.$queryRaw<RawMonthlyRow[]>`
      SELECT
        TO_CHAR(DATE_TRUNC('month', date), 'YYYY-MM') AS month,
        SUM(revenue)::text    AS revenue,
        SUM(units_sold)::text AS units_sold
      FROM daily_product_metrics
      WHERE product_id = ${productId}
        AND store_id = ${storeId}
        AND date >= NOW() - INTERVAL '12 months'
      GROUP BY 1
      ORDER BY 1
    `,

    // Variant stats
    prisma.$queryRaw<RawVariantRow[]>`
      SELECT
        pv.id                                           AS variant_id,
        pv.title,
        pv.sku,
        pv.price::text,
        pv.cost::text,
        COALESCE(SUM(oi.quantity), 0)::text             AS units_sold,
        COALESCE(SUM(oi.total), 0)::text                AS revenue,
        ii.quantity::text                               AS current_stock
      FROM product_variants pv
      LEFT JOIN order_items oi ON oi.variant_id = pv.id
        AND EXISTS (
          SELECT 1 FROM orders o
          WHERE o.id = oi.order_id AND o.payment_status = 'paid' AND o.store_id = ${storeId}
        )
      LEFT JOIN inventory_items ii ON ii.variant_id = pv.id
      WHERE pv.product_id = ${productId}
      GROUP BY pv.id, pv.title, pv.sku, pv.price, pv.cost, ii.quantity
      ORDER BY units_sold DESC
    `,

    // Geo — top 5 cities
    prisma.$queryRaw<RawGeoRow[]>`
      SELECT
        COALESCE(o.shipping_address->>'city', 'Necunoscut') AS name,
        COUNT(DISTINCT o.id)::text                          AS orders
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      JOIN product_variants pv ON oi.variant_id = pv.id
      WHERE pv.product_id = ${productId}
        AND o.store_id = ${storeId}
        AND o.payment_status = 'paid'
        AND o.shipping_address IS NOT NULL
        AND o.shipping_address->>'city' IS NOT NULL
      GROUP BY 1
      ORDER BY orders DESC
      LIMIT 5
    `,

    // Geo — top 5 countries
    prisma.$queryRaw<RawGeoRow[]>`
      SELECT
        COALESCE(o.shipping_address->>'country', 'Necunoscut') AS name,
        COUNT(DISTINCT o.id)::text                             AS orders
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      JOIN product_variants pv ON oi.variant_id = pv.id
      WHERE pv.product_id = ${productId}
        AND o.store_id = ${storeId}
        AND o.payment_status = 'paid'
        AND o.shipping_address IS NOT NULL
        AND o.shipping_address->>'country' IS NOT NULL
      GROUP BY 1
      ORDER BY orders DESC
      LIMIT 5
    `,

    // Buyers — unique customers + per-customer purchase count + LTV
    prisma.$queryRaw<RawBuyerRow[]>`
      SELECT
        o.customer_id,
        COUNT(DISTINCT o.id)::text AS purchase_count,
        COALESCE(SUM(o2.total), 0)::text AS ltv
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      JOIN product_variants pv ON oi.variant_id = pv.id
      LEFT JOIN orders o2 ON o2.customer_id = o.customer_id
        AND o2.store_id = ${storeId}
        AND o2.payment_status = 'paid'
      WHERE pv.product_id = ${productId}
        AND o.store_id = ${storeId}
        AND o.payment_status = 'paid'
        AND o.customer_id IS NOT NULL
      GROUP BY o.customer_id
    `,

    // Variant geo — top city + top country per variant
    prisma.$queryRaw<RawVariantGeoRow[]>`
      SELECT
        variant_id,
        MAX(CASE WHEN city_rank = 1 THEN city END)         AS top_city,
        MAX(CASE WHEN city_rank = 1 THEN city_orders END)::text  AS top_city_orders,
        MAX(CASE WHEN country_rank = 1 THEN country END)   AS top_country,
        MAX(CASE WHEN country_rank = 1 THEN country_orders END)::text AS top_country_orders
      FROM (
        SELECT
          pv.id AS variant_id,
          o.shipping_address->>'city'    AS city,
          o.shipping_address->>'country' AS country,
          COUNT(*) FILTER (WHERE o.shipping_address->>'city' IS NOT NULL) AS city_orders,
          COUNT(*) FILTER (WHERE o.shipping_address->>'country' IS NOT NULL) AS country_orders,
          RANK() OVER (PARTITION BY pv.id ORDER BY COUNT(*) FILTER (WHERE o.shipping_address->>'city' IS NOT NULL) DESC) AS city_rank,
          RANK() OVER (PARTITION BY pv.id ORDER BY COUNT(*) FILTER (WHERE o.shipping_address->>'country' IS NOT NULL) DESC) AS country_rank
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        JOIN product_variants pv ON oi.variant_id = pv.id
        WHERE pv.product_id = ${productId}
          AND o.store_id = ${storeId}
          AND o.payment_status = 'paid'
          AND o.shipping_address IS NOT NULL
        GROUP BY pv.id, o.shipping_address->>'city', o.shipping_address->>'country'
      ) ranked
      GROUP BY variant_id
    `,

    // Frequently bought together
    prisma.$queryRaw<RawCoProductRow[]>`
      SELECT
        p2.id   AS product_id,
        p2.title,
        COUNT(DISTINCT o.id)::text AS co_orders
      FROM orders o
      JOIN order_items oi1 ON oi1.order_id = o.id
      JOIN product_variants pv1 ON oi1.variant_id = pv1.id AND pv1.product_id = ${productId}
      JOIN order_items oi2 ON oi2.order_id = o.id AND oi2.id != oi1.id
      JOIN product_variants pv2 ON oi2.variant_id = pv2.id AND pv2.product_id != ${productId}
      JOIN products p2 ON pv2.product_id = p2.id AND p2.store_id = ${storeId}
      WHERE o.store_id = ${storeId}
        AND o.payment_status = 'paid'
      GROUP BY p2.id, p2.title
      ORDER BY co_orders DESC
      LIMIT 5
    `,
  ])

  const t = totalsRows[0]
  const l = last30dRows[0]
  const totalRevenue = Math.round(parseFloat(t?.revenue ?? '0') * 100) / 100
  const totalProfit = Math.round(parseFloat(t?.profit ?? '0') * 100) / 100

  const buyerCount = buyerRows.length
  const repeatBuyers = buyerRows.filter((r) => parseInt(r.purchase_count, 10) >= 2).length
  const avgBuyerLtv = buyerCount > 0
    ? Math.round((buyerRows.reduce((s, r) => s + parseFloat(r.ltv), 0) / buyerCount) * 100) / 100
    : 0

  return {
    totals: {
      revenue: totalRevenue,
      profit: totalProfit,
      unitsSold: parseInt(t?.units_sold ?? '0', 10),
      orders: parseInt(t?.orders ?? '0', 10),
      margin: totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 10000) / 100 : 0,
    },
    last30d: {
      revenue: Math.round(parseFloat(l?.revenue ?? '0') * 100) / 100,
      profit: Math.round(parseFloat(l?.profit ?? '0') * 100) / 100,
      unitsSold: parseInt(l?.units_sold ?? '0', 10),
      orders: parseInt(l?.orders ?? '0', 10),
    },
    monthlySales: fillMonths(monthlyRows),
    variantStats: variantRows.map((r) => {
      const rev = parseFloat(r.revenue)
      const cost = r.cost ? parseFloat(r.cost) : null
      const units = parseInt(r.units_sold, 10)
      const profit = cost !== null ? Math.round((rev - cost * units) * 100) / 100 : 0
      const geo = variantGeoRows.find((g) => g.variant_id === r.variant_id)
      return {
        variantId: r.variant_id,
        title: r.title,
        sku: r.sku,
        price: Math.round(parseFloat(r.price) * 100) / 100,
        cost,
        unitsSold: units,
        revenue: Math.round(rev * 100) / 100,
        profit,
        currentStock: r.current_stock !== null ? parseInt(r.current_stock, 10) : 0,
        topCity: geo?.top_city ?? null,
        topCityOrders: geo ? parseInt(geo.top_city_orders, 10) : 0,
        topCountry: geo?.top_country ?? null,
        topCountryOrders: geo ? parseInt(geo.top_country_orders, 10) : 0,
      }
    }),
    geo: {
      cities: cityRows.map((r) => ({ name: r.name, orders: parseInt(r.orders, 10) })),
      countries: countryRows.map((r) => ({ name: r.name, orders: parseInt(r.orders, 10) })),
    },
    buyers: {
      total: buyerCount,
      repeatBuyers,
      repeatRate: buyerCount > 0 ? Math.round((repeatBuyers / buyerCount) * 10000) / 100 : 0,
      avgBuyerLtv,
    },
    frequentlyBoughtWith: coProductRows.map((r) => ({
      productId: r.product_id,
      title: r.title,
      coOrders: parseInt(r.co_orders, 10),
    })),
  }
}
