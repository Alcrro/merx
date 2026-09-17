'use client'

import { useTranslations } from 'next-intl'
import { DASHBOARD_URL } from '@/config/nav'
import { ArrowIcon } from '@/components/atoms/ArrowIcon'
import { CheckIcon } from '@/components/atoms/CheckIcon'
import { trackEvent } from '@/lib/analytics'
import { MarketplacePreviewTable } from '@/components/molecules/MarketplacePreviewTable'

interface PreviewRow { name: string; meta: string; price: string }

export function MarketplaceFeaturesSection() {
  const t = useTranslations('marketplace.features')
  const items = t.raw('items') as string[]
  const rows = t.raw('rows') as PreviewRow[]

  return (
    <section className="border-y border-line bg-surface section-py">
      <div className="container-page">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

          <div className="flex-1 max-w-lg">
            <h2 className="text-heading-xl">{t('title')}</h2>
            <p className="mt-4 text-fg-muted leading-relaxed">{t('description')}</p>
            <ul className="mt-8 space-y-3">
              {items.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-fg-muted">
                  <span className="mt-0.5 shrink-0 text-primary"><CheckIcon /></span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <a
                href={`${DASHBOARD_URL}/marketplace`}
                onClick={() => trackEvent('marketplace_features_cta_clicked')}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-white hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
              >
                {t('cta')}
                <ArrowIcon />
              </a>
            </div>
          </div>

          <div className="flex-1 w-full max-w-lg" role="img" aria-label="Preview marketplace Merx">
            <MarketplacePreviewTable
              rows={rows}
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
