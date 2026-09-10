import styles from './TopBar.module.css'

const LINKS = ['Market', 'My Listings', 'Trades', 'History']

interface Props { onSellClick: () => void }

export function TopBar({ onSellClick }: Props) {
  return (
    <header className={styles.topbar}>
      <div className={styles.logo}>
        <span className={styles.gem} />
        MERX
        <span className={styles.gem} />
      </div>

      <div className={styles.sep} />

      <nav className={styles.nav}>
        {LINKS.map((label, i) => (
          <button key={label} className={`${styles.link} ${i === 0 ? styles.active : ''}`}>
            {label}
          </button>
        ))}
      </nav>

      <div className={styles.right}>
        <div className={styles.currency}><span>🪙</span><span className={styles.val}>48,320</span></div>
        <div className={styles.currency}><span>💎</span><span className={styles.val}>1,200</span></div>
        <button className={styles.sellBtn} onClick={onSellClick}>Sell Item</button>
      </div>
    </header>
  )
}
