'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { DASHBOARD_URL } from '@/config/nav'
import { ArrowIcon } from '@/components/atoms/ArrowIcon'
import { CheckIcon } from '@/components/atoms/CheckIcon'
import { trackEvent } from '@/lib/analytics'
import { MARKETPLACE_ROW_CONFIGS } from '@/features/home/config'
import { MarketplacePreviewTable } from '@/components/molecules/MarketplacePreviewTable'

interface MarketplaceRow {
  name: string
  meta: string
}

export function MarketplaceSection() {
  const t = useTranslations('home.marketplace')
  const features = t.raw('features') as string[]
  const rows = t.raw('rows') as MarketplaceRow[]

  const previewRows = rows.map((row, i) => {
    const cfg = MARKETPLACE_ROW_CONFIGS[i]
    return { name: row.name, meta: row.meta, emoji: cfg.emoji, price: `${cfg.price} ${cfg.currency}` }
  })

  return (
    <section id="marketplace" className="bg-surface section-py overflow-hidden">
      <div className="container-page">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

          <div className="flex-1 max-w-lg">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-subtle px-3 py-1 text-xs font-semibold text-primary mb-6">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500" />
              </span>
              {t('badge')}
            </span>
            <h2 className="text-heading-xl">{t('title')}</h2>
            <p className="mt-4 text-fg-muted text-base leading-relaxed">{t('description')}</p>
            <ul className="mt-8 space-y-3">
              {features.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-fg-muted">
                  <span className="mt-0.5 shrink-0 text-primary"><CheckIcon /></span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex items-center gap-3 flex-wrap">
              <a
                href={`${DASHBOARD_URL}/marketplace`}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-white hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
                onClick={() => trackEvent('marketplace_cta_clicked')}
              >
                {t('ctaPrimary')}
                <ArrowIcon />
              </a>
              <Link href="/marketplace" className="text-sm font-medium text-fg-muted hover:text-fg transition-colors">
                {t('ctaSecondary')} →
              </Link>
            </div>
          </div>

          <div className="flex-1 w-full max-w-lg">
            <MarketplacePreviewTable
              rows={previewRows}
              labels={{
                product: t('tableProduct'),
                price: t('tablePrice'),
                action: t('tableAction'),
                listingCount: t('listingCount'),
                buyButton: t('buyButton'),
              }}
              variant="light"
            />
          </div>

        </div>
      </div>
    </section>
  )
}
