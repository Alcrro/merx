import styles from './Panel.module.css'

interface PanelProps {
  children: React.ReactNode
  className?: string
  corners?: boolean
}

export function Panel({ children, className = '', corners = true }: PanelProps) {
  return (
    <div className={`${styles.panel} ${corners ? styles.corners : ''} ${className}`}>
      {children}
    </div>
  )
}

export function PanelTitle({ children }: { children: React.ReactNode }) {
  return <div className={styles.title}>{children}</div>
}

export function Divider() {
  return <div className={styles.divider} />
}
