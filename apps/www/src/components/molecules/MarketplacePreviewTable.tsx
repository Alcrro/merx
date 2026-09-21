interface PreviewRow {
  name: string
  meta: string
  price: string
  emoji?: string
}

interface MarketplacePreviewTableProps {
  rows: PreviewRow[]
  labels: {
    product: string
    price: string
    action: string
    listingCount: string
    buyButton: string
  }
  variant?: 'light' | 'dark'
}

const styles = {
  light: {
    wrapper: 'rounded-2xl bg-surface border border-line-strong overflow-hidden shadow-xl',
    header: 'grid grid-cols-[1fr_auto_auto] gap-4 px-5 py-3 border-b border-line bg-surface-subtle',
    headerText: 'text-eyebrow',
    row: 'grid grid-cols-[1fr_auto_auto] gap-4 items-center px-5 py-3.5 border-b border-line last:border-0 hover:bg-surface-subtle transition-colors',
    iconBg: 'h-8 w-8 rounded-lg bg-surface-elevated border border-line flex items-center justify-center text-base shrink-0',
    name: 'text-sm font-medium text-fg truncate',
    meta: 'text-[11px] text-fg-muted truncate',
    price: 'text-sm font-semibold text-fg tabular-nums whitespace-nowrap',
    button: 'text-xs px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-medium transition-colors whitespace-nowrap',
    footer: 'px-5 py-3 bg-surface-subtle border-t border-line',
    footerText: 'text-[11px] text-fg-subtle',
  },
  dark: {
    wrapper: 'rounded-2xl bg-gray-900 ring-1 ring-white/10 overflow-hidden shadow-2xl',
    header: 'grid grid-cols-[1fr_auto_auto] gap-4 px-5 py-3 border-b border-white/5 bg-white/5',
    headerText: 'text-xs font-semibold uppercase tracking-wider text-gray-400',
    row: 'grid grid-cols-[1fr_auto_auto] gap-4 items-center px-5 py-3.5 border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors',
    iconBg: 'h-8 w-8 rounded-lg bg-gray-800 flex items-center justify-center text-base shrink-0',
    name: 'text-sm font-medium text-gray-100 truncate',
    meta: 'text-[11px] text-gray-400 truncate',
    price: 'text-sm font-semibold text-gray-100 tabular-nums whitespace-nowrap',
    button: 'text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors whitespace-nowrap',
    footer: 'px-5 py-3 bg-white/[0.02] border-t border-white/5',
    footerText: 'text-[11px] text-gray-400',
  },
}

export function MarketplacePreviewTable({ rows, labels, variant = 'light' }: MarketplacePreviewTableProps) {
  const s = styles[variant]

  return (
    <div className={s.wrapper}>
      <div className={s.header}>
        <span className={s.headerText}>{labels.product}</span>
        <span className={s.headerText}>{labels.price}</span>
        <span className={s.headerText}>{labels.action}</span>
      </div>
      {rows.map((row) => (
        <div key={row.name} className={s.row}>
          <div className="flex items-center gap-3 min-w-0">
            <div aria-hidden="true" className={s.iconBg}>{row.emoji ?? '📦'}</div>
            <div className="min-w-0">
              <p className={s.name}>{row.name}</p>
              <p className={s.meta}>{row.meta}</p>
            </div>
          </div>
          <span className={s.price}>{row.price}</span>
          <div aria-hidden="true" className={s.button}>
            {labels.buyButton}
          </div>
        </div>
      ))}
      <div className={s.footer}>
        <span className={s.footerText}>{labels.listingCount}</span>
      </div>
    </div>
  )
}
