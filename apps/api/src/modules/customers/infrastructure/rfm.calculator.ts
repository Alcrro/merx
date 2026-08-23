import { prisma } from '../../../lib/prisma'
import type { RFMScore, RFMSegment } from '../domain/entities'

function scoreRecency(daysSinceLastOrder: number | null): number {
  if (daysSinceLastOrder === null) return 1
  if (daysSinceLastOrder <= 7) return 5
  if (daysSinceLastOrder <= 30) return 4
  if (daysSinceLastOrder <= 90) return 3
  if (daysSinceLastOrder <= 180) return 2
  return 1
}

function scoreFrequency(orderCount: number): number {
  if (orderCount <= 0) return 1
  if (orderCount === 1) return 1
  if (orderCount === 2) return 2
  if (orderCount <= 5) return 3
  if (orderCount <= 10) return 4
  return 5
}

function scoreMonetary(ltv: number, quantiles: number[]): number {
  // quantiles = [q20, q40, q60, q80] breakpoints
  if (ltv <= quantiles[0]) return 1
  if (ltv <= quantiles[1]) return 2
  if (ltv <= quantiles[2]) return 3
  if (ltv <= quantiles[3]) return 4
  return 5
}

function classify(r: number, f: number, m: number): RFMSegment {
  if (r >= 4 && f >= 4 && m >= 4) return 'champion'
  if (f >= 4 && m >= 3) return 'loyal'
  if (r >= 4 && f === 1) return 'new'
  if (r >= 3 && f >= 2) return 'potential_loyalist'
  if (r <= 2 && f >= 3) return 'at_risk'
  return 'lost'
}

interface RawQuantileRow {
  q20: string | null
  q40: string | null
  q60: string | null
  q80: string | null
}

export async function getStoreLtvQuantiles(storeId: string): Promise<number[]> {
  const rows = await prisma.$queryRaw<RawQuantileRow[]>`
    SELECT
      PERCENTILE_CONT(0.2) WITHIN GROUP (ORDER BY ltv) AS q20,
      PERCENTILE_CONT(0.4) WITHIN GROUP (ORDER BY ltv) AS q40,
      PERCENTILE_CONT(0.6) WITHIN GROUP (ORDER BY ltv) AS q60,
      PERCENTILE_CONT(0.8) WITHIN GROUP (ORDER BY ltv) AS q80
    FROM (
      SELECT COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total ELSE 0 END), 0) AS ltv
      FROM orders
      WHERE store_id = ${storeId}
      GROUP BY customer_id
    ) sub
  `
  const row = rows[0]
  return [
    parseFloat(row?.q20 ?? '0'),
    parseFloat(row?.q40 ?? '0'),
    parseFloat(row?.q60 ?? '0'),
    parseFloat(row?.q80 ?? '0'),
  ]
}

export function calculateRFMScore(
  customer: { orderCount: number; ltv: number; lastOrderAt: Date | null },
  quantiles: number[]
): RFMScore {
  const daysSinceLastOrder = customer.lastOrderAt
    ? Math.round((Date.now() - new Date(customer.lastOrderAt).getTime()) / 86_400_000)
    : null

  const r = scoreRecency(daysSinceLastOrder)
  const f = scoreFrequency(customer.orderCount)
  const m = scoreMonetary(customer.ltv, quantiles)

  return { r, f, m, segment: classify(r, f, m) }
}
