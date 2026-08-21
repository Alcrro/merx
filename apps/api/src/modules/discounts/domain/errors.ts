export class DiscountNotFoundError extends Error {
  readonly code = 'NOT_FOUND' as const
  readonly httpStatus = 404
  constructor() { super('Discount code not found'); this.name = 'DiscountNotFoundError' }
}

export class DiscountForbiddenError extends Error {
  readonly code = 'FORBIDDEN' as const
  readonly httpStatus = 403
  constructor() { super('Access denied'); this.name = 'DiscountForbiddenError' }
}

export class DiscountCodeConflictError extends Error {
  readonly code = 'CODE_CONFLICT' as const
  readonly httpStatus = 409
  constructor(code: string) { super(`Code "${code}" already exists`); this.name = 'DiscountCodeConflictError' }
}

export class DiscountInvalidError extends Error {
  readonly code: string
  readonly httpStatus = 400
  readonly minimumAmount?: number
  constructor(reason: string, minimumAmount?: number) {
    super(reason)
    this.name = 'DiscountInvalidError'
    this.code = reason
    this.minimumAmount = minimumAmount
  }
}

// Raised when tryReserve returns 0 rows — slot taken under concurrent load
export class DiscountMaxUsesReachedError extends Error {
  readonly code = 'CODE_MAX_USES_REACHED' as const
  readonly httpStatus = 409
  constructor() { super('Discount code has reached its usage limit'); this.name = 'DiscountMaxUsesReachedError' }
}
