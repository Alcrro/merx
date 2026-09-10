export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export interface MarketItem {
  id: string
  name: string
  icon: string
  rarity: Rarity
  category: string
  price: number
  quantity: number
  isNew?: boolean
  vendor: Vendor
  stats?: ItemStat[]
}

export interface Vendor {
  id: string
  name: string
  avatar: string
  rating: number
  tradeCount: number
  verified: boolean
}

export interface ItemStat {
  key: string
  value: string
  type?: 'normal' | 'good' | 'warn'
}

export interface Category {
  id: string
  label: string
  icon: string
  count: number
}

export interface MarketplaceFilters {
  category: string
  rarities: Rarity[]
  search: string
  sortBy: 'price_asc' | 'price_desc' | 'newest' | 'popular'
}
