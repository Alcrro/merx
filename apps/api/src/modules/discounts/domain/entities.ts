export type DiscountType = 'percentage' | 'fixed'
export type ReservationStatus = 'reserved' | 'consumed' | 'released'

export type ValidationReason =
  | 'CODE_NOT_FOUND'
  | 'CODE_INACTIVE'
  | 'CODE_NOT_STARTED'
  | 'CODE_EXPIRED'
  | 'CODE_MAX_USES_REACHED'
  | 'CURRENCY_MISMATCH'
  | 'MINIMUM_ORDER_NOT_MET'

export interface DiscountCodeEntity {
  id: string
  storeId: string
  code: string
  type: DiscountType
  // percentage: 10.00 = 10% ; fixed: 15.00 = 15 RON
  value: number
  currency: string
  minOrderAmount: number | null
  maxUses: number | null
  usedCount: number
  startsAt: Date | null
  expiresAt: Date | null
  isActive: boolean
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface DiscountReservationEntity {
  id: string
  discountCodeId: string
  storeId: string
  stripeSessionId: string | null
  amount: number
  status: ReservationStatus
  createdAt: Date
  resolvedAt: Date | null
}

export interface DiscountValidationResult {
  valid: true
  discount: {
    type: DiscountType
    value: number
    calculatedAmount: number
    currency: string
  }
}

export interface DiscountInvalidResult {
  valid: false
  reason: ValidationReason
  minimumAmount?: number
}

export type DiscountCheckResult = DiscountValidationResult | DiscountInvalidResult

export interface CreateDiscountData {
  code: string
  type: DiscountType
  value: number
  minOrderAmount?: number
  maxUses?: number
  startsAt?: Date
  expiresAt?: Date
  isActive?: boolean
}

export interface UpdateDiscountData {
  value?: number
  minOrderAmount?: number | null
  maxUses?: number | null
  startsAt?: Date | null
  expiresAt?: Date | null
  isActive?: boolean
}

export interface ListDiscountsParams {
  storeId: string
  isActive?: boolean
  search?: string
  page: number
  limit: number
}

export interface PaginatedDiscounts {
  data: DiscountCodeEntity[]
  total: number
  page: number
  limit: number
}
