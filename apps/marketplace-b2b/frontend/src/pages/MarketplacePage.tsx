import { MarketplaceLayout } from '../components/layout/MarketplaceLayout'
import { ItemGrid } from '../features/marketplace/components/ItemGrid'
import { Panel } from '../components/ui/Panel'
import { useMarketplace } from '../features/marketplace/hooks/useMarketplace'
import styles from './MarketplacePage.module.css'

const PAGES = ['‹', '1', '2', '3', '...', '24', '›']

export default function MarketplacePage() {
  const { items, filters, updateFilter, toggleRarity, selectedItem, setSelectedItem } = useMarketplace()

  return (
    <MarketplaceLayout
      filters={filters}
      onFilterChange={updateFilter}
      onToggleRarity={toggleRarity}
      selectedItem={selectedItem}
    >
      <div className={styles.header}>
        <h1 className={styles.title}>⚔️ {filters.category === 'all' ? 'All Items' : filters.category.charAt(0).toUpperCase() + filters.category.slice(1)}</h1>
        <span className={styles.count}>{items.length.toLocaleString()} items listed</span>
        <select
          className={styles.sort}
          value={filters.sortBy}
          onChange={e => updateFilter('sortBy', e.target.value as typeof filters.sortBy)}
        >
          <option value="popular">Sort: Most Popular</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
          <option value="newest">Newest First</option>
        </select>
      </div>

      <div className={styles.ornament}>
        <div className={styles.line} />
        <span className={styles.diamond}>◆</span>
        <span className={styles.ornText}>Featured Listings</span>
        <span className={styles.diamond}>◆</span>
        <div className={`${styles.line} ${styles.rev}`} />
      </div>

      <Panel corners>
        <div style={{ padding: 16 }}>
          <ItemGrid items={items} selectedId={selectedItem?.id ?? null} onSelect={setSelectedItem} />
        </div>
      </Panel>

      <div className={styles.pagination}>
        {PAGES.map((p, i) => (
          <button key={i} className={`${styles.pageBtn} ${p === '1' ? styles.active : ''}`}>{p}</button>
        ))}
      </div>
    </MarketplaceLayout>
  )
}
