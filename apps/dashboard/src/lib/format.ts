// Converts a major-unit amount (e.g. 15.00) to a locale-formatted string.
// All monetary values from the API are major units (Decimal fields).
export function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatPercent(value: number): string {
  return `${value.toFixed(value % 1 === 0 ? 0 : 2)}%`
}
