import { ItemSlot } from './ItemSlot'
import type { MarketItem } from '../../../types/marketplace'
import styles from './ItemGrid.module.css'

interface Props {
  items: MarketItem[]
  selectedId: string | null
  onSelect: (item: MarketItem) => void
}

export function ItemGrid({ items, selectedId, onSelect }: Props) {
  if (items.length === 0) {
    return <div className={styles.empty}>No items match your filters</div>
  }

  return (
    <div className={styles.grid}>
      {items.map(item => (
        <ItemSlot
          key={item.id}
          item={item}
          selected={item.id === selectedId}
          onClick={() => onSelect(item)}
        />
      ))}
    </div>
  )
}
