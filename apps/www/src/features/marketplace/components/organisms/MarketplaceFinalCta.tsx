'use client'

import { useTranslations } from 'next-intl'
import { DASHBOARD_URL } from '@/config/nav'
import { ArrowIcon } from '@/components/atoms/ArrowIcon'
import { trackEvent } from '@/lib/analytics'

export function MarketplaceFinalCta() {
  const t = useTranslations('marketplace.cta')

  return (
    <section className="section-py bg-surface">
      <div className="container-page">
        <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 px-8 py-16 text-center shadow-2xl shadow-primary/20">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">{t('title')}</h2>
          <p className="mt-4 text-white/80 text-base max-w-md mx-auto">{t('description')}</p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={`${DASHBOARD_URL}/signup`}
              onClick={() => trackEvent('marketplace_final_cta_clicked')}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-primary hover:bg-primary-subtle transition-colors shadow-lg"
            >
              {t('ctaPrimary')}
              <ArrowIcon />
            </a>
            <a
              href={`${DASHBOARD_URL}/marketplace`}
              onClick={() => trackEvent('marketplace_final_open_clicked')}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3.5 text-sm font-semibold text-white/80 hover:bg-white/10 transition-colors"
            >
              {t('ctaSecondary')}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
