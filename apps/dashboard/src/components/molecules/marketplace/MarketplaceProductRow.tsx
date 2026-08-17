import { useState } from 'react'
import type { FeedItem, ListingCondition } from '@merx/api-client'
import { RiskBadge } from '../../atoms/RiskBadge'
import { MetaDot } from '../../atoms/MetaDot'
import { Button } from '../../atoms/Button'
import { storefrontUrl } from '../../../lib/storefront'
import { CATEGORY_LABELS, CONDITION_LABELS } from '../../../lib/marketplace.constants'

const ROW_GRID = 'minmax(0,1fr) 180px 90px 120px'

function ProductThumbnail({ title, imageUrl }: { title: string; imageUrl: string | null }) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={title}
        className="h-9 w-9 rounded-lg object-cover shrink-0 ring-1 ring-gray-200 dark:ring-gray-700"
      />
    )
  }
  return (
    <div className="h-9 w-9 rounded-lg shrink-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-lg select-none">
      📦
    </div>
  )
}

function PricingBadge({ price, negotiable }: { price: number; negotiable: boolean }) {
  if (price <= 0) return (
    <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-[10px] font-medium text-gray-500 dark:text-gray-400">
      La cerere
    </span>
  )
  if (negotiable) return (
    <span className="inline-flex items-center rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-400">
      Negociabil
    </span>
  )
  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-[10px] font-medium text-gray-500 dark:text-gray-400">
      Preț fix
    </span>
  )
}

function ConditionBadge({ condition }: { condition: ListingCondition }) {
  const base = 'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border'
  const styles: Record<ListingCondition, string> = {
    new: 'bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800/50 text-green-700 dark:text-green-400',
    refurbished: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-400',
    used: 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800/50 text-orange-700 dark:text-orange-400',
  }
  return <span className={`${base} ${styles[condition]}`}>{CONDITION_LABELS[condition]}</span>
}

function PriceDisplay({ price, currency }: { price: number; currency: string }) {
  if (price <= 0) return <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
  return (
    <div className="text-right">
      <span className="text-base font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
        {price.toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
      <span className="ml-1 text-xs text-gray-400 dark:text-gray-500">{currency}</span>
    </div>
  )
}

function ActionButton({ item, onClick }: { item: FeedItem; onClick: () => void }) {
  if (item.negotiable) return <Button size="sm" variant="outline" onClick={onClick}>Cere ofertă</Button>
  if (item.price > 0) return <Button size="sm" onClick={onClick}>Alege</Button>
  return (
    <Button size="sm" variant="ghost" onClick={onClick}>
      Vezi detalii
      <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Button>
  )
}

export function MarketplaceProductRow({ item, onNavigate }: { item: FeedItem; onNavigate: (variantId?: string) => void }) {
  const [expanded, setExpanded] = useState(false)
  const hasVariants = item.variants.length > 1

  return (
    <div className="border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div
        className="grid items-center gap-4 px-5 py-3.5 hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors cursor-default"
        style={{ gridTemplateColumns: ROW_GRID }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => hasVariants && setExpanded((v) => !v)}
            className={[
              'shrink-0 h-4 w-4 flex items-center justify-center rounded text-gray-400 dark:text-gray-500 transition-colors',
              hasVariants
                ? 'hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 cursor-pointer'
                : 'cursor-default opacity-0 pointer-events-none',
            ].join(' ')}
          >
            <svg
              className={['h-3 w-3 transition-transform duration-150', expanded ? 'rotate-90' : ''].join(' ')}
              fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <ProductThumbnail title={item.title} imageUrl={item.imageUrl} />

          <div className="min-w-0">
            <button
              onClick={() => onNavigate()}
              className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left leading-snug truncate block max-w-full"
            >
              {item.title}
            </button>
            <div className="mt-1 flex items-center gap-2 flex-wrap">
              <PricingBadge price={item.price} negotiable={item.negotiable} />
              <ConditionBadge condition={item.condition} />
              <MetaDot />
              <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                {CATEGORY_LABELS[item.category] ?? item.category}
              </span>
              {item.deliveryDays != null && (
                <>
                  <MetaDot />
                  <span className="text-[11px] text-gray-400 dark:text-gray-500">
                    {item.deliveryDays} {item.deliveryDays === 1 ? 'zi' : 'zile'} livrare
                  </span>
                </>
              )}
              <MetaDot />
              <a
                href={storefrontUrl(item.store.slug)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-[11px] text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline underline-offset-2 transition-colors"
              >
                {item.store.name}
              </a>
              {hasVariants && (
                <>
                  <MetaDot />
                  <span className="text-[11px] text-indigo-500 dark:text-indigo-400 font-medium">
                    {item.variants.length} variante
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <PriceDisplay price={item.price} currency={item.currency} />
        <div className="flex justify-center"><RiskBadge severity={item.severity} /></div>
        <div className="flex justify-end"><ActionButton item={item} onClick={() => onNavigate()} /></div>
      </div>

      {expanded && hasVariants && (
        <div className="ml-[52px] mr-5 mb-2 border-l-2 border-indigo-100 dark:border-indigo-900/60 pl-4">
          {item.variants.map((v) => (
            <div
              key={v.id}
              className="grid items-center gap-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors px-2"
              style={{ gridTemplateColumns: ROW_GRID }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm text-gray-600 dark:text-gray-300 truncate">{v.title}</span>
                {v.sku && (
                  <span className="shrink-0 text-[11px] font-mono text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                    {v.sku}
                  </span>
                )}
                <PricingBadge price={v.price} negotiable={item.negotiable} />
                <ConditionBadge condition={item.condition} />
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 tabular-nums">
                  {v.price.toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="ml-1 text-xs text-gray-400 dark:text-gray-500">{item.currency}</span>
              </div>
              <span />
              <div className="flex justify-end">
                <Button size="sm" onClick={() => onNavigate(v.id)}>Alege</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
