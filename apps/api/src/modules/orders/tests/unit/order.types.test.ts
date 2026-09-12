import { describe, it, expect } from 'vitest'
import {
  canTransition,
  validateCombination,
  ORDER_TRANSITIONS,
  PAYMENT_TRANSITIONS,
  FULFILLMENT_TRANSITIONS,
} from '../../domain/types'
import { getDisplayStatus } from '../../presentation/mappers/order.mapper'

describe('canTransition', () => {
  describe('ORDER_TRANSITIONS', () => {
    it.each([
      ['DRAFT', 'ACTIVE'],
      ['DRAFT', 'CANCELLED'],
      ['ACTIVE', 'COMPLETED'],
      ['ACTIVE', 'CANCELLED'],
    ])('%s → %s is valid', (from, to) => {
      expect(canTransition(ORDER_TRANSITIONS, from, to)).toBe(true)
    })

    it.each([
      ['COMPLETED', 'ACTIVE'],
      ['COMPLETED', 'CANCELLED'],
      ['CANCELLED', 'ACTIVE'],
      ['CANCELLED', 'COMPLETED'],
      ['ACTIVE', 'DRAFT'],
    ])('%s → %s is invalid', (from, to) => {
      expect(canTransition(ORDER_TRANSITIONS, from, to)).toBe(false)
    })
  })

  describe('PAYMENT_TRANSITIONS', () => {
    it.each([
      ['PENDING', 'PAID'],
      ['PENDING', 'AUTHORIZED'],
      ['PENDING', 'PAYMENT_FAILED'],
      ['PENDING', 'VOID'],
      ['AUTHORIZED', 'PAID'],
      ['PAID', 'REFUND_PENDING'],
      ['PAID', 'PARTIALLY_REFUNDED'],
      ['REFUND_PENDING', 'REFUNDED'],
    ])('%s → %s is valid', (from, to) => {
      expect(canTransition(PAYMENT_TRANSITIONS, from, to)).toBe(true)
    })

    it.each([
      ['PAID', 'PENDING'],
      ['REFUNDED', 'PAID'],
      ['VOID', 'PAID'],
    ])('%s → %s is invalid', (from, to) => {
      expect(canTransition(PAYMENT_TRANSITIONS, from, to)).toBe(false)
    })
  })

  describe('FULFILLMENT_TRANSITIONS', () => {
    it.each([
      ['UNFULFILLED', 'PROCESSING'],
      ['PROCESSING', 'SHIPPED'],
      ['SHIPPED', 'DELIVERED'],
      ['SHIPPED', 'LOST_IN_TRANSIT'],
    ])('%s → %s is valid', (from, to) => {
      expect(canTransition(FULFILLMENT_TRANSITIONS, from, to)).toBe(true)
    })

    it.each([
      ['FULFILLED', 'PROCESSING'],
      ['RETURNED', 'SHIPPED'],
      ['UNFULFILLED', 'SHIPPED'],
    ])('%s → %s is invalid', (from, to) => {
      expect(canTransition(FULFILLMENT_TRANSITIONS, from, to)).toBe(false)
    })
  })
})

describe('validateCombination', () => {
  it.each([
    [{ status: 'ACTIVE', paymentStatus: 'VOID', fulfillmentStatus: 'UNFULFILLED' }],
    [{ status: 'CANCELLED', paymentStatus: 'PAID', fulfillmentStatus: 'UNFULFILLED' }],
    [{ status: 'COMPLETED', paymentStatus: 'PAID', fulfillmentStatus: 'UNFULFILLED' }],
  ])('throws on invalid combination: %o', (combo) => {
    expect(() => validateCombination(combo)).toThrow()
  })

  it.each([
    [{ status: 'ACTIVE', paymentStatus: 'PAID', fulfillmentStatus: 'UNFULFILLED' }],
    [{ status: 'ACTIVE', paymentStatus: 'PENDING', fulfillmentStatus: 'UNFULFILLED' }],
    [{ status: 'COMPLETED', paymentStatus: 'PAID', fulfillmentStatus: 'FULFILLED' }],
    [{ status: 'CANCELLED', paymentStatus: 'VOID', fulfillmentStatus: 'UNFULFILLED' }],
  ])('does not throw on valid combination: %o', (combo) => {
    expect(() => validateCombination(combo)).not.toThrow()
  })
})

describe('getDisplayStatus', () => {
  it.each([
    [{ status: 'CANCELLED', paymentStatus: 'VOID', fulfillmentStatus: 'UNFULFILLED' }, 'CANCELLED'],
    [{ status: 'COMPLETED', paymentStatus: 'PAID', fulfillmentStatus: 'FULFILLED' }, 'COMPLETED'],
    [{ status: 'ACTIVE', paymentStatus: 'PENDING', fulfillmentStatus: 'UNFULFILLED' }, 'AWAITING_PAYMENT'],
    [{ status: 'ACTIVE', paymentStatus: 'AUTHORIZED', fulfillmentStatus: 'UNFULFILLED' }, 'PAYMENT_AUTHORIZED'],
    [{ status: 'ACTIVE', paymentStatus: 'PAYMENT_FAILED', fulfillmentStatus: 'UNFULFILLED' }, 'PAYMENT_FAILED'],
    [{ status: 'ACTIVE', paymentStatus: 'PAID', fulfillmentStatus: 'UNFULFILLED' }, 'CONFIRMED'],
    [{ status: 'ACTIVE', paymentStatus: 'PAID', fulfillmentStatus: 'PROCESSING' }, 'PROCESSING'],
    [{ status: 'ACTIVE', paymentStatus: 'PAID', fulfillmentStatus: 'SHIPPED' }, 'SHIPPED'],
    [{ status: 'ACTIVE', paymentStatus: 'PAID', fulfillmentStatus: 'LOST_IN_TRANSIT' }, 'LOST_IN_TRANSIT'],
    [{ status: 'ACTIVE', paymentStatus: 'PAID', fulfillmentStatus: 'DELIVERED' }, 'DELIVERED'],
  ] as const)('maps %o → %s', (order, expected) => {
    expect(getDisplayStatus(order)).toBe(expected)
  })
})
