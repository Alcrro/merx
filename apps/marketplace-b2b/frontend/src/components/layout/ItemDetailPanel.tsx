import { Panel, PanelTitle, Divider } from '../ui/Panel'
import type { MarketItem } from '../../types/marketplace'
import styles from './ItemDetailPanel.module.css'

interface Props { item: MarketItem | null }

export function ItemDetailPanel({ item }: Props) {
  if (!item) {
    return (
      <aside>
        <Panel corners>
          <PanelTitle>Item Detail</PanelTitle>
          <div className={styles.empty}>Select an item from the grid</div>
        </Panel>
      </aside>
    )
  }

  return (
    <aside>
      <Panel corners>
        <PanelTitle>Item Detail</PanelTitle>

        <div className={styles.preview}>
          <div className={styles.iconWrap} style={{ borderColor: `var(--r-${item.rarity})` }}>
            {item.icon}
          </div>
          <div className={styles.name} style={{ color: `var(--r-${item.rarity})` }}>{item.name}</div>
          <div className={styles.type}>{item.category} · {item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}</div>
        </div>

        <Divider />

        {item.stats && item.stats.length > 0 && (
          <>
            <div className={styles.stats}>
              {item.stats.map(s => (
                <div key={s.key} className={styles.statRow}>
                  <span className={styles.statKey}>{s.key}</span>
                  <span className={`${styles.statVal} ${s.type ? styles[s.type] : ''}`}>{s.value}</span>
                </div>
              ))}
            </div>
            <Divider />
          </>
        )}

        <div className={styles.priceBlock}>
          <div className={styles.priceLabel}>Listed Price</div>
          <div className={styles.price}>🪙 {item.price.toLocaleString()}</div>
          <div className={styles.priceSub}>Qty available: {item.quantity}</div>
        </div>

        <Divider />

        <div className={styles.vendor}>
          <div className={styles.vendorAvatar}>{item.vendor.avatar}</div>
          <div>
            <div className={styles.vendorName}>{item.vendor.name}</div>
            <div className={styles.vendorMeta}>
              {'★'.repeat(Math.round(item.vendor.rating))} {item.vendor.rating} · {item.vendor.tradeCount.toLocaleString()} trades
            </div>
          </div>
          {item.vendor.verified && <span className={styles.verified}>✓</span>}
        </div>

        <Divider />

        <div className={styles.actions}>
          <button className={styles.btnBuy}>⚔ Buy Now — {item.price.toLocaleString()} 🪙</button>
          <button className={styles.btnOffer}>Make an Offer</button>
        </div>
      </Panel>
    </aside>
  )
}
