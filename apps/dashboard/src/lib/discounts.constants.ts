export type ValidationReason =
  | 'CODE_NOT_FOUND'
  | 'CODE_INACTIVE'
  | 'CODE_NOT_STARTED'
  | 'CODE_EXPIRED'
  | 'CODE_MAX_USES_REACHED'
  | 'CURRENCY_MISMATCH'
  | 'MINIMUM_ORDER_NOT_MET'

export const DISCOUNT_REASON_MESSAGES: Record<ValidationReason, string> = {
  CODE_NOT_FOUND: 'Codul introdus nu există',
  CODE_INACTIVE: 'Codul nu este activ',
  CODE_NOT_STARTED: 'Codul nu este încă valabil',
  CODE_EXPIRED: 'Codul a expirat',
  CODE_MAX_USES_REACHED: 'Codul nu mai este disponibil',
  CURRENCY_MISMATCH: 'Codul nu se aplică acestui magazin',
  MINIMUM_ORDER_NOT_MET: 'Valoarea minimă a comenzii nu este atinsă',
}

export function getDiscountReasonMessage(reason: string, minimumAmount?: number, currency?: string): string {
  if (reason === 'MINIMUM_ORDER_NOT_MET' && minimumAmount !== undefined && currency) {
    const formatted = new Intl.NumberFormat('ro-RO', { style: 'currency', currency }).format(minimumAmount)
    return `Valoare minimă comandă: ${formatted}`
  }
  return DISCOUNT_REASON_MESSAGES[reason as ValidationReason] ?? 'Codul nu poate fi aplicat'
}

export const DISCOUNT_TYPE_LABELS: Record<string, string> = {
  percentage: 'Procentual',
  fixed: 'Valoare fixă',
}
