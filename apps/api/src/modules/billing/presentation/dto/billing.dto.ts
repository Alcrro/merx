import type { ActiveSubscription, BillingCard, BillingInvoice } from '../../domain/types'

export interface SubscriptionResponseDto {
  subscription: ActiveSubscription | null
}

export interface PaymentMethodsResponseDto {
  paymentMethods: BillingCard[]
}

export interface InvoicesResponseDto {
  invoices: BillingInvoice[]
}

export interface CheckoutResponseDto {
  url: string
}

export interface PortalResponseDto {
  url: string
}

export interface CustomerResponseDto {
  customerId: string
}
