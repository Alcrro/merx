'use client'

import { useTranslations } from 'next-intl'
import { DASHBOARD_URL } from '@/config/nav'
import { ArrowIcon } from '@/components/atoms/ArrowIcon'
import { trackEvent } from '@/lib/analytics'

export function MarketplaceHero() {
  const t = useTranslations('marketplace.hero')

  return (
    <section className="relative overflow-hidden bg-surface pt-24 pb-20 sm:pt-32 sm:pb-28">
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container-page text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-subtle px-4 py-1.5 text-sm font-medium text-primary mb-8">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
          </span>
          {t('badge')}
        </span>

        <h1 className="mx-auto max-w-3xl text-5xl sm:text-6xl font-extrabold tracking-tight text-fg leading-[1.05]">
          {t('title')}{' '}
          <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
            {t('titleHighlight')}
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg text-fg-muted leading-relaxed">
          {t('description')}
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={`${DASHBOARD_URL}/marketplace`}
            onClick={() => trackEvent('marketplace_hero_cta_clicked')}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary-hover transition-colors"
          >
            {t('ctaPrimary')}
            <ArrowIcon />
          </a>
          <a
            href={`${DASHBOARD_URL}/signup`}
            onClick={() => trackEvent('marketplace_hero_signup_clicked')}
            className="inline-flex items-center gap-2 rounded-xl border border-line-strong px-6 py-3.5 text-sm font-semibold text-fg hover:bg-surface-subtle transition-colors"
          >
            {t('ctaSecondary')}
          </a>
        </div>
      </div>
    </section>
  )
}
