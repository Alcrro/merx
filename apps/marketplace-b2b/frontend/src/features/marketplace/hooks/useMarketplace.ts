import { useState, useMemo } from 'react'
import type { MarketItem, MarketplaceFilters, Rarity } from '../../../types/marketplace'
import { MOCK_ITEMS } from '../mock-data'

const DEFAULT_FILTERS: MarketplaceFilters = {
  category: 'all',
  rarities: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
  search: '',
  sortBy: 'popular',
}

export function useMarketplace() {
  const [filters, setFilters] = useState<MarketplaceFilters>(DEFAULT_FILTERS)
  const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null)

  const items = useMemo(() => {
    let result = [...MOCK_ITEMS]

    if (filters.category !== 'all') {
      result = result.filter(i => i.category === filters.category)
    }
    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter(i => i.name.toLowerCase().includes(q))
    }
    result = result.filter(i => filters.rarities.includes(i.rarity))

    if (filters.sortBy === 'price_asc')  result.sort((a, b) => a.price - b.price)
    if (filters.sortBy === 'price_desc') result.sort((a, b) => b.price - a.price)

    return result
  }, [filters])

  function updateFilter<K extends keyof MarketplaceFilters>(key: K, value: MarketplaceFilters[K]) {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  function toggleRarity(rarity: Rarity) {
    const current = filters.rarities
    const next = current.includes(rarity)
      ? current.filter(r => r !== rarity)
      : [...current, rarity]
    updateFilter('rarities', next)
  }

  return { items, filters, updateFilter, toggleRarity, selectedItem, setSelectedItem }
}
