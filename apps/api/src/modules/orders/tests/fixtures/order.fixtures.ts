import { vi } from 'vitest'
import { Order } from '../../domain/entities/order.entity'
import type { OrderItemEntity, OrderCustomerEntity } from '../../domain/entities/order.entity'
import type { IOrderQueryRepository } from '../../application/ports'
import type { IOrderCommandRepository } from '../../domain/ports/order-command.repository.port'

export function makeOrderItem(overrides: Partial<OrderItemEntity> = {}): OrderItemEntity {
  return {
    id: 'item1',
    orderId: 'o1',
    variantId: 'v1',
    title: 'T-Shirt Red L',
    sku: 'SKU-1',
    quantity: 2,
    unitPrice: 29.99,
    total: 59.98,
    ...overrides,
  }
}

export function makeOrderCustomer(overrides: Partial<OrderCustomerEntity> = {}): OrderCustomerEntity {
  return {
    id: 'c1',
    email: 'customer@example.com',
    firstName: 'Ion',
    lastName: 'Popescu',
    ...overrides,
  }
}

export function makeOrder(
  overrides: Partial<ConstructorParameters<typeof Order>[0]> = {}
): Order {
  return new Order({
    id: 'o1',
    storeId: 's1',
    customerId: 'c1',
    orderNumber: 1001,
    status: 'confirmed',
    paymentStatus: 'paid',
    fulfillmentStatus: 'unfulfilled',
    currency: 'RON',
    subtotal: 59.98,
    discountTotal: 0,
    taxTotal: 0,
    shippingTotal: 15,
    total: 74.98,
    shippingAddress: null,
    createdAt: new Date('2026-01-01T10:00:00Z'),
    updatedAt: new Date('2026-01-01T10:00:00Z'),
    customer: makeOrderCustomer(),
    items: [makeOrderItem()],
    ...overrides,
  })
}

export function makeQueryRepo(): IOrderQueryRepository {
  return {
    list: vi.fn(),
    findById: vi.fn(),
    findByOrderNumber: vi.fn(),
    findStripeSessionId: vi.fn(),
  }
}

export function makeCommandRepo(): IOrderCommandRepository {
  return {
    create: vi.fn(),
    updateStatus: vi.fn(),
    updatePaymentStatus: vi.fn(),
    updateFulfillmentStatus: vi.fn(),
  }
}
