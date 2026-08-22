import { OrderError } from '../errors'

export type OrderStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'partially_refunded'
export type FulfillmentStatus = 'unfulfilled' | 'partially_fulfilled' | 'fulfilled'

export interface OrderItemEntity {
  id: string
  orderId: string
  variantId: string | null
  title: string
  sku: string | null
  quantity: number
  unitPrice: number
  total: number
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
  readonly currency: string
  readonly subtotal: number
  readonly discountTotal: number
  readonly taxTotal: number
  readonly shippingTotal: number
  readonly total: number
  readonly shippingAddress: Record<string, unknown> | null
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
    currency: string
    subtotal: number
    discountTotal: number
    taxTotal: number
    shippingTotal: number
    total: number
    shippingAddress: Record<string, unknown> | null
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
    this.currency = data.currency
    this.subtotal = data.subtotal
    this.discountTotal = data.discountTotal
    this.taxTotal = data.taxTotal
    this.shippingTotal = data.shippingTotal
    this.total = data.total
    this.shippingAddress = data.shippingAddress
    this.createdAt = data.createdAt
    this.updatedAt = data.updatedAt
    this.customer = data.customer
    this.items = data.items
  }

  guardCanChangeStatus(newStatus: OrderStatus): void {
    if (this.status === 'cancelled') throw OrderError.conflict('Cannot change status of a cancelled order')
    if (this.status === 'completed' && newStatus !== 'completed') throw OrderError.conflict('Cannot revert a completed order')
  }

  guardCanUpdatePayment(): void {
    if (this.status === 'cancelled') throw OrderError.conflict('Cannot update payment on a cancelled order')
  }

  guardCanUpdateFulfillment(): void {
    if (this.status === 'cancelled') throw OrderError.conflict('Cannot update fulfillment on a cancelled order')
  }

  guardCanCancel(): void {
    if (this.status === 'cancelled') throw OrderError.conflict('Order is already cancelled')
    if (this.status === 'completed') throw OrderError.conflict('Cannot cancel a completed order')
  }

  guardCanRefund(): void {
    if (this.paymentStatus === 'refunded') throw OrderError.conflict('Order is already refunded')
    if (this.paymentStatus !== 'paid') throw OrderError.conflict('Only paid orders can be refunded')
  }
}
