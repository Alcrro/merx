import { describe, it, expect } from 'vitest'
import { toOrderResponse } from '../../presentation/mappers/order.mapper'
import { makeOrder } from '../fixtures/order.fixtures'

describe('toOrderResponse', () => {
  it('converts Date fields to ISO strings', () => {
    const order = makeOrder()
    const dto = toOrderResponse(order)
    expect(dto.createdAt).toBe(order.createdAt.toISOString())
    expect(dto.updatedAt).toBe(order.updatedAt.toISOString())
  })

  it('preserves all numeric and string fields', () => {
    const order = makeOrder()
    const dto = toOrderResponse(order)
    expect(dto.id).toBe(order.id)
    expect(dto.total).toBe(order.total)
    expect(dto.status).toBe(order.status)
    expect(dto.paymentStatus).toBe(order.paymentStatus)
    expect(dto.fulfillmentStatus).toBe(order.fulfillmentStatus)
  })

  it('preserves items and customer', () => {
    const order = makeOrder()
    const dto = toOrderResponse(order)
    expect(dto.items).toHaveLength(1)
    expect(dto.customer?.email).toBe('customer@example.com')
  })

  it('handles null customer', () => {
    const order = makeOrder({ customer: null })
    const dto = toOrderResponse(order)
    expect(dto.customer).toBeNull()
  })
})
