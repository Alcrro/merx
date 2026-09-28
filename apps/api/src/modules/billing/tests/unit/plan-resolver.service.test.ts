import { describe, it, expect } from 'vitest'
import { makePlanResolver, PRICES } from '../fixtures/billing.fixtures'

describe('PlanResolver', () => {
  it('maps plan → price and price → plan', () => {
    const resolver = makePlanResolver()
    expect(resolver.priceFor('pro')).toBe(PRICES.pro)
    expect(resolver.planFor(PRICES.scale)).toBe('scale')
  })

  it('returns null for a price outside the self-serve plans', () => {
    expect(makePlanResolver().planFor('price_enterprise_custom')).toBeNull()
  })

  it('throws INVALID_PLAN when the plan has no configured price', () => {
    const resolver = makePlanResolver({ ...PRICES, scale: '' })
    expect(() => resolver.priceFor('scale')).toThrow(expect.objectContaining({ code: 'INVALID_PLAN' }))
  })

  it('never matches an unconfigured (empty) price', () => {
    expect(makePlanResolver({ ...PRICES, scale: '' }).planFor('')).toBeNull()
  })
})
