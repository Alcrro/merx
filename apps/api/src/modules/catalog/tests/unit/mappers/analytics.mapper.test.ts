import { describe, it, expect } from 'vitest'
import { Prisma } from '@prisma/client'
import { toAnalyticsOrder } from '../../../infrastructure/db/mappers/analytics.mapper'

describe('toAnalyticsOrder', () => {
  const base = {
    id: 'o1',
    createdAt: new Date('2024-03-01'),
    customerId: 'c1',
    shippingAddress: { city: 'Cluj', country: 'RO' } as Prisma.JsonValue,
    items: [
      { orderId: 'o1', title: 'T-Shirt Red', quantity: 2, total: new Prisma.Decimal('59.98') },
    ],
  }

  it('converts item total Decimal to number', () => {
    const result = toAnalyticsOrder(base)
    expect(result.items[0].total).toBe(59.98)
    expect(typeof result.items[0].total).toBe('number')
  })

  it('preserves all item fields', () => {
    const result = toAnalyticsOrder(base)
    expect(result.items[0]).toEqual({ orderId: 'o1', title: 'T-Shirt Red', quantity: 2, total: 59.98 })
  })

  it('maps null customerId', () => {
    expect(toAnalyticsOrder({ ...base, customerId: null }).customerId).toBeNull()
  })

  it('casts shippingAddress JsonValue to Record', () => {
    const result = toAnalyticsOrder(base)
    expect(result.shippingAddress).toEqual({ city: 'Cluj', country: 'RO' })
  })

  it('maps null shippingAddress', () => {
    expect(toAnalyticsOrder({ ...base, shippingAddress: null }).shippingAddress).toBeNull()
  })

  it('maps multiple items', () => {
    const raw = {
      ...base,
      items: [
        { orderId: 'o1', title: 'A', quantity: 1, total: new Prisma.Decimal('10') },
        { orderId: 'o1', title: 'B', quantity: 3, total: new Prisma.Decimal('30') },
      ],
    }
    expect(toAnalyticsOrder(raw).items).toHaveLength(2)
  })
})
