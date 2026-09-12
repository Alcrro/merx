import { OrderError } from '../errors'
import {
  type OrderStatus,
  type PaymentStatus,
  type FulfillmentStatus,
  canTransition,
  validateCombination,
  ORDER_TRANSITIONS,
  PAYMENT_TRANSITIONS,
  FULFILLMENT_TRANSITIONS,
} from '../types'

export type { OrderStatus, PaymentStatus, FulfillmentStatus }

export interface OrderItemEntity {
  id: string
  orderId: string
  variantId: string | null
  title: string
  sku: string | null
  quantity: number
  unitPrice: number
  total: number
  productSnapshot: Record<string, unknown> | null
}

export interface OrderCustomerEntity {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
}

export class Order {
  readonly id: string
  readonly storeId: string
  readonly customerId: string | null
  readonly orderNumber: number
  readonly status: OrderStatus
  readonly paymentStatus: PaymentStatus
  readonly fulfillmentStatus: FulfillmentStatus
  readonly source: string
  readonly currency: string
  readonly subtotal: number
  readonly discountTotal: number
  readonly taxTotal: number
  readonly shippingTotal: number
  readonly total: number
  readonly shippingAddress: Record<string, unknown> | null
  readonly stripePaymentIntentId: string | null
  readonly stripeSessionId: string | null
  readonly paymentEventAt: Date | null
  readonly version: number
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly customer: OrderCustomerEntity | null
  readonly items: OrderItemEntity[]

  constructor(data: {
    id: string
    storeId: string
    customerId: string | null
    orderNumber: number
    status: OrderStatus
    paymentStatus: PaymentStatus
    fulfillmentStatus: FulfillmentStatus
    source: string
    currency: string
    subtotal: number
    discountTotal: number
    taxTotal: number
    shippingTotal: number
    total: number
    shippingAddress: Record<string, unknown> | null
    stripePaymentIntentId: string | null
    stripeSessionId: string | null
    paymentEventAt: Date | null
    version: number
    createdAt: Date
    updatedAt: Date
    customer: OrderCustomerEntity | null
    items: OrderItemEntity[]
  }) {
    this.id = data.id
    this.storeId = data.storeId
    this.customerId = data.customerId
    this.orderNumber = data.orderNumber
    this.status = data.status
    this.paymentStatus = data.paymentStatus
    this.fulfillmentStatus = data.fulfillmentStatus
    this.source = data.source
    this.currency = data.currency
    this.subtotal = data.subtotal
    this.discountTotal = data.discountTotal
    this.taxTotal = data.taxTotal
    this.shippingTotal = data.shippingTotal
    this.total = data.total
    this.shippingAddress = data.shippingAddress
    this.stripePaymentIntentId = data.stripePaymentIntentId
    this.stripeSessionId = data.stripeSessionId
    this.paymentEventAt = data.paymentEventAt
    this.version = data.version
    this.createdAt = data.createdAt
    this.updatedAt = data.updatedAt
    this.customer = data.customer
    this.items = data.items
  }

  guardCanChangeStatus(newStatus: OrderStatus): void {
    if (!canTransition(ORDER_TRANSITIONS, this.status, newStatus)) {
      throw OrderError.conflict(`Invalid transition: ${this.status} → ${newStatus}`)
    }
  }

  guardCanChangePaymentStatus(newStatus: PaymentStatus): void {
    if (!canTransition(PAYMENT_TRANSITIONS, this.paymentStatus, newStatus)) {
      throw OrderError.conflict(`Invalid payment transition: ${this.paymentStatus} → ${newStatus}`)
    }
    validateCombination({ status: this.status, paymentStatus: newStatus, fulfillmentStatus: this.fulfillmentStatus })
  }

  guardCanChangeFulfillmentStatus(newStatus: FulfillmentStatus): void {
    if (!canTransition(FULFILLMENT_TRANSITIONS, this.fulfillmentStatus, newStatus)) {
      throw OrderError.conflict(`Invalid fulfillment transition: ${this.fulfillmentStatus} → ${newStatus}`)
    }
    validateCombination({ status: this.status, paymentStatus: this.paymentStatus, fulfillmentStatus: newStatus })
  }

  guardCanCancel(): void {
    if (!canTransition(ORDER_TRANSITIONS, this.status, 'CANCELLED')) {
      throw OrderError.conflict(`Cannot cancel order in status: ${this.status}`)
    }
  }

  guardCanRefund(): void {
    if (!canTransition(PAYMENT_TRANSITIONS, this.paymentStatus, 'REFUND_PENDING')) {
      throw OrderError.conflict(`Cannot refund order with payment status: ${this.paymentStatus}`)
    }
  }
}
