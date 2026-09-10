import { TopBar } from './TopBar'
import { CategorySidebar } from './CategorySidebar'
import { ItemDetailPanel } from './ItemDetailPanel'
import type { MarketItem, MarketplaceFilters, Rarity } from '../../types/marketplace'
import styles from './MarketplaceLayout.module.css'

interface Props {
  filters: MarketplaceFilters
  onFilterChange: <K extends keyof MarketplaceFilters>(key: K, val: MarketplaceFilters[K]) => void
  onToggleRarity: (r: Rarity) => void
  selectedItem: MarketItem | null
  children: React.ReactNode
}

export function MarketplaceLayout({ filters, onFilterChange, onToggleRarity, selectedItem, children }: Props) {
  return (
    <div className={styles.root}>
      <TopBar onSellClick={() => {}} />
      <div className={styles.body}>
        <CategorySidebar filters={filters} onFilterChange={onFilterChange} onToggleRarity={onToggleRarity} />
        <main className={styles.main}>{children}</main>
        <ItemDetailPanel item={selectedItem} />
      </div>
    </div>
  )
}
