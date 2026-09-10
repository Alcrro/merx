import type { MarketItem } from '../../../types/marketplace'
import styles from './ItemSlot.module.css'

interface Props {
  item: MarketItem
  selected: boolean
  onClick: () => void
}

export function ItemSlot({ item, selected, onClick }: Props) {
  return (
    <button
      className={`${styles.slot} ${styles[item.rarity]} ${selected ? styles.selected : ''}`}
      onClick={onClick}
      title={item.name}
    >
      {item.isNew && <span className={styles.newDot} />}
      <span className={styles.icon}>{item.icon}</span>
      <span className={styles.name}>{item.name}</span>
      <span className={styles.price}>{item.price.toLocaleString()} 🪙</span>
      <span className={styles.qty}>x{item.quantity}</span>
    </button>
  )
}
