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

export function formatRelativeDate(date: string | Date): string {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMin < 1) return 'acum'
  if (diffMin < 60) return `acum ${diffMin}m`
  if (diffHours < 24) return `acum ${diffHours}h`
  if (diffDays === 1) return 'ieri'
  return d.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' })
}
