import type { CustomerSortBy, RFMSegment } from '@merx/types'

export const PAGE_SIZE = 20

export const SORT_OPTIONS: { label: string; value: CustomerSortBy }[] = [
  { label: 'LTV descrescător', value: 'ltv' },
  { label: 'Comenzi descrescător', value: 'orderCount' },
  { label: 'Ultima comandă', value: 'lastOrderAt' },
  { label: 'Data înregistrării', value: 'createdAt' },
]

export const RISK_DOT: Record<'green' | 'yellow' | 'red', string> = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-400',
  red: 'bg-red-500',
}

export const SEGMENT_OPTIONS: { label: string; value: RFMSegment | 'all' }[] = [
  { label: 'Toate segmentele', value: 'all' },
  { label: 'Champion', value: 'champion' },
  { label: 'Loial', value: 'loyal' },
  { label: 'Potențial loial', value: 'potential_loyalist' },
  { label: 'La risc', value: 'at_risk' },
  { label: 'Pierdut', value: 'lost' },
  { label: 'Nou', value: 'new' },
]
