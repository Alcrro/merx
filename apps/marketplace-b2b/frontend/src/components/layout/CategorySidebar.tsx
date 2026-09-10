import { Panel, PanelTitle } from '../ui/Panel'
import type { MarketplaceFilters, Rarity } from '../../types/marketplace'
import { CATEGORIES } from '../../features/marketplace/mock-data'
import styles from './CategorySidebar.module.css'

const RARITIES: { id: Rarity; label: string; color: string }[] = [
  { id: 'legendary', label: 'Legendary', color: 'var(--r-legendary)' },
  { id: 'epic',      label: 'Epic',      color: 'var(--r-epic)'      },
  { id: 'rare',      label: 'Rare',      color: 'var(--r-rare)'      },
  { id: 'uncommon',  label: 'Uncommon',  color: 'var(--r-uncommon)'  },
  { id: 'common',    label: 'Common',    color: 'var(--r-common)'    },
]

interface Props {
  filters: MarketplaceFilters
  onFilterChange: <K extends keyof MarketplaceFilters>(key: K, val: MarketplaceFilters[K]) => void
  onToggleRarity: (r: Rarity) => void
}

export function CategorySidebar({ filters, onFilterChange, onToggleRarity }: Props) {
  return (
    <aside className={styles.sidebar}>
      <Panel corners>
        <PanelTitle>Categories</PanelTitle>
        <div className={styles.searchWrap}>
          <input
            className={styles.search}
            placeholder="Search items..."
            value={filters.search}
            onChange={e => onFilterChange('search', e.target.value)}
          />
        </div>
        <div className={styles.catList}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`${styles.catItem} ${filters.category === cat.id ? styles.active : ''}`}
              onClick={() => onFilterChange('category', cat.id)}
            >
              <span className={styles.catIcon}>{cat.icon}</span>
              {cat.label}
              <span className={styles.catCount}>{cat.count.toLocaleString()}</span>
            </button>
          ))}
        </div>
      </Panel>

      <Panel corners>
        <PanelTitle>Rarity</PanelTitle>
        <div className={styles.rarityList}>
          {RARITIES.map(r => (
            <label key={r.id} className={styles.rarityRow}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={filters.rarities.includes(r.id)}
                onChange={() => onToggleRarity(r.id)}
              />
              <span className={styles.dot} style={{ background: r.color, boxShadow: `0 0 6px ${r.color}` }} />
              <span style={{ color: r.color, fontSize: 13 }}>{r.label}</span>
            </label>
          ))}
        </div>
      </Panel>
    </aside>
  )
}
