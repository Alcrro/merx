import type { DiscountCodeEntity, DiscountCheckResult, ValidationReason } from './entities'

// All arguments and return values are in major units (e.g., 15.00 RON).
// Only at the Stripe boundary is the amount multiplied by 100.

export function evaluateCode(
  code: DiscountCodeEntity,
  storeCurrency: string,
  subtotal: number,
  now: Date = new Date(),
): DiscountCheckResult {
  // Order is fixed and tested — first failing rule wins.
  if (code.deletedAt !== null) return invalid('CODE_NOT_FOUND')
  if (!code.isActive) return invalid('CODE_INACTIVE')
  if (code.startsAt && now < code.startsAt) return invalid('CODE_NOT_STARTED')
  if (code.expiresAt && now > code.expiresAt) return invalid('CODE_EXPIRED')
  if (code.maxUses !== null && code.usedCount >= code.maxUses) return invalid('CODE_MAX_USES_REACHED')
  if (code.currency !== storeCurrency) return invalid('CURRENCY_MISMATCH')
  if (code.minOrderAmount !== null && subtotal < code.minOrderAmount) {
    return { valid: false, reason: 'MINIMUM_ORDER_NOT_MET', minimumAmount: code.minOrderAmount }
  }

  const calculatedAmount = calculateDiscount(code.type, code.value, subtotal)

  return {
    valid: true,
    discount: { type: code.type, value: code.value, calculatedAmount, currency: code.currency },
  }
}

export function calculateDiscount(type: 'percentage' | 'fixed', value: number, subtotal: number): number {
  if (type === 'percentage') {
    // Floor to 2 decimal places — favours merchant by at most 0.01
    const raw = subtotal * (value / 100)
    return Math.min(Math.floor(raw * 100) / 100, subtotal)
  }
  return Math.min(value, subtotal)
}

function invalid(reason: ValidationReason): DiscountCheckResult {
  return { valid: false, reason }
}
