import type { ListingCategory, ListingCondition, FeedSortBy } from '@merx/api-client'

export const CATEGORY_LABELS: Record<string, string> = {
  physical: 'Fizic',
  service: 'Servicii',
  digital: 'Digital',
}

export const CONDITION_LABELS: Record<ListingCondition, string> = {
  new: 'Nou',
  refurbished: 'Resigilat',
  used: 'Second hand',
}

export const CONDITION_OPTIONS: { value: ListingCondition; label: string }[] = [
  { value: 'new', label: 'Nou' },
  { value: 'refurbished', label: 'Resigilat' },
  { value: 'used', label: 'Second hand' },
]

export const CATEGORY_OPTIONS: { value: ListingCategory; label: string }[] = [
  { value: 'physical', label: 'Produs fizic' },
  { value: 'service', label: 'Serviciu' },
  { value: 'digital', label: 'Digital' },
]

export const CURRENCY_OPTIONS = [
  { value: 'EUR', label: 'EUR' },
  { value: 'RON', label: 'RON' },
  { value: 'USD', label: 'USD' },
]

export const COUNTRY_OPTIONS = [
  { value: 'RO', label: 'România' },
  { value: 'MD', label: 'Moldova' },
  { value: 'DE', label: 'Germania' },
  { value: 'FR', label: 'Franța' },
  { value: 'IT', label: 'Italia' },
  { value: 'ES', label: 'Spania' },
  { value: 'GB', label: 'Marea Britanie' },
]

export const LISTING_CATEGORIES: { value: ListingCategory | ''; label: string }[] = [
  { value: '', label: 'Toate' },
  { value: 'physical', label: 'Fizic' },
  { value: 'service', label: 'Servicii' },
  { value: 'digital', label: 'Digital' },
]

export const SORT_OPTIONS: { value: FeedSortBy; label: string }[] = [
  { value: 'newest', label: 'Cele mai noi' },
  { value: 'price_asc', label: 'Preț: mic → mare' },
  { value: 'price_desc', label: 'Preț: mare → mic' },
]

export const DELIVERY_OPTIONS: { value: number | undefined; label: string }[] = [
  { value: undefined, label: 'Orice' },
  { value: 1, label: '1 zi' },
  { value: 3, label: '3 zile' },
  { value: 7, label: '7 zile' },
  { value: 30, label: '30 zile' },
]
