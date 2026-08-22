import { describe, it, expect } from 'vitest'
import { round2, daysAgo, fillMonths, computePeriodStats, computeGeo, computeBuyers } from '../../application/queries/analytics.utils'
import type { AnalyticsOrder } from '../../domain/types'

// ─── round2 ──────────────────────────────────────────────────────────────────

describe('round2', () => {
  it('rounds to 2 decimal places', () => {
    expect(round2(1.234)).toBe(1.23)
    expect(round2(1.235)).toBe(1.24)
    expect(round2(29.999)).toBe(30)
  })

  it('leaves already-rounded numbers unchanged', () => {
    expect(round2(10)).toBe(10)
    expect(round2(9.99)).toBe(9.99)
  })
})

// ─── daysAgo ─────────────────────────────────────────────────────────────────

describe('daysAgo', () => {
  it('returns a date exactly N days before the given date', () => {
    const now = new Date('2024-06-15')
    const result = daysAgo(now, 7)
    expect(result.toISOString().slice(0, 10)).toBe('2024-06-08')
  })

  it('does not mutate the original date', () => {
    const now = new Date('2024-06-15')
    daysAgo(now, 30)
    expect(now.toISOString().slice(0, 10)).toBe('2024-06-15')
  })

  it('returns same date for 0 days', () => {
    const now = new Date('2024-06-15')
    expect(daysAgo(now, 0).toISOString().slice(0, 10)).toBe('2024-06-15')
  })
})

// ─── fillMonths ───────────────────────────────────────────────────────────────

describe('fillMonths', () => {
  it('always returns exactly 12 months', () => {
    expect(fillMonths(new Map())).toHaveLength(12)
  })

  it('fills missing months with zero revenue and unitsSold', () => {
    const result = fillMonths(new Map())
    expect(result.every((r) => r.revenue === 0 && r.unitsSold === 0)).toBe(true)
  })

  it('uses data from map when key matches', () => {
    const now = new Date()
    const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const map = new Map([[key, { revenue: 100, unitsSold: 5 }]])
    const result = fillMonths(map)
    const current = result.at(-1)!
    expect(current.revenue).toBe(100)
    expect(current.unitsSold).toBe(5)
  })

  it('months are in ascending chronological order', () => {
    const result = fillMonths(new Map())
    const months = result.map((r) => r.month)
    expect(months).toEqual([...months].sort())
  })
})

// ─── computePeriodStats ───────────────────────────────────────────────────────

function makeOrder(id: string, items: { orderId: string; title: string; quantity: number; total: number }[], customerId?: string): AnalyticsOrder {
  return { id, createdAt: new Date(), customerId: customerId ?? null, shippingAddress: null, items }
}

describe('computePeriodStats', () => {
  it('returns zeros for empty orders', () => {
    expect(computePeriodStats([])).toEqual({ revenue: 0, unitsSold: 0, orders: 0 })
  })

  it('sums revenue and units across all items', () => {
    const orders = [
      makeOrder('o1', [
        { orderId: 'o1', title: 'T-Shirt Red', quantity: 2, total: 59.98 },
        { orderId: 'o1', title: 'T-Shirt Blue', quantity: 1, total: 29.99 },
      ]),
    ]
    const result = computePeriodStats(orders)
    expect(result.revenue).toBe(89.97)
    expect(result.unitsSold).toBe(3)
    expect(result.orders).toBe(1)
  })

  it('counts unique order IDs (not items)', () => {
    const orders = [
      makeOrder('o1', [
        { orderId: 'o1', title: 'A', quantity: 1, total: 10 },
        { orderId: 'o1', title: 'B', quantity: 1, total: 10 },
      ]),
      makeOrder('o2', [{ orderId: 'o2', title: 'C', quantity: 1, total: 10 }]),
    ]
    expect(computePeriodStats(orders).orders).toBe(2)
  })

  it('rounds revenue to 2 decimals', () => {
    const orders = [
      makeOrder('o1', [{ orderId: 'o1', title: 'X', quantity: 1, total: 10.123 }]),
      makeOrder('o2', [{ orderId: 'o2', title: 'Y', quantity: 1, total: 10.124 }]),
    ]
    expect(computePeriodStats(orders).revenue).toBe(20.25)
  })
})

// ─── computeGeo ──────────────────────────────────────────────────────────────

describe('computeGeo', () => {
  it('returns empty arrays for orders without shipping address', () => {
    const orders = [makeOrder('o1', [])]
    const result = computeGeo(orders)
    expect(result.cities).toEqual([])
    expect(result.countries).toEqual([])
  })

  it('counts and sorts cities by order count descending', () => {
    const orders = [
      { ...makeOrder('o1', []), shippingAddress: { city: 'Cluj', country: 'RO' } },
      { ...makeOrder('o2', []), shippingAddress: { city: 'Cluj', country: 'RO' } },
      { ...makeOrder('o3', []), shippingAddress: { city: 'Bucharest', country: 'RO' } },
    ]
    const result = computeGeo(orders)
    expect(result.cities[0]).toEqual({ name: 'Cluj', orders: 2 })
    expect(result.cities[1]).toEqual({ name: 'Bucharest', orders: 1 })
  })

  it('returns at most 5 cities and 5 countries', () => {
    const orders = Array.from({ length: 10 }, (_, i) => ({
      ...makeOrder(`o${i}`, []),
      shippingAddress: { city: `City${i}`, country: `Country${i}` },
    }))
    const result = computeGeo(orders)
    expect(result.cities.length).toBeLessThanOrEqual(5)
    expect(result.countries.length).toBeLessThanOrEqual(5)
  })
})

// ─── computeBuyers ────────────────────────────────────────────────────────────

describe('computeBuyers', () => {
  it('returns zeros when no orders', () => {
    expect(computeBuyers([], new Map())).toEqual({ total: 0, repeatBuyers: 0, repeatRate: 0, avgBuyerLtv: 0 })
  })

  it('ignores orders without customerId', () => {
    const orders = [makeOrder('o1', [], undefined)]
    expect(computeBuyers(orders, new Map()).total).toBe(0)
  })

  it('counts unique customers', () => {
    const orders = [makeOrder('o1', [], 'c1'), makeOrder('o2', [], 'c1'), makeOrder('o3', [], 'c2')]
    expect(computeBuyers(orders, new Map()).total).toBe(2)
  })

  it('identifies repeat buyers (2+ orders)', () => {
    const orders = [makeOrder('o1', [], 'c1'), makeOrder('o2', [], 'c1'), makeOrder('o3', [], 'c2')]
    const result = computeBuyers(orders, new Map())
    expect(result.repeatBuyers).toBe(1)
    expect(result.repeatRate).toBe(50)
  })

  it('computes avgBuyerLtv from ltvMap', () => {
    const orders = [makeOrder('o1', [], 'c1'), makeOrder('o2', [], 'c2')]
    const ltvMap = new Map([['c1', 200], ['c2', 100]])
    expect(computeBuyers(orders, ltvMap).avgBuyerLtv).toBe(150)
  })

  it('uses 0 ltv for customers not in map', () => {
    const orders = [makeOrder('o1', [], 'c1')]
    expect(computeBuyers(orders, new Map()).avgBuyerLtv).toBe(0)
  })
})
