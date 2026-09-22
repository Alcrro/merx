'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { DASHBOARD_URL } from '@/config/nav'
import { ArrowIcon } from '@/components/atoms/ArrowIcon'
import { trackEvent } from '@/lib/analytics'

export function HeroSection() {
  const t = useTranslations('home.hero')
  const tc = useTranslations('common')

  return (
    <section className="relative overflow-hidden pt-24 pb-20 sm:pt-32 sm:pb-28 bg-surface">
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-b from-primary-subtle via-surface to-transparent dark:from-primary/10 dark:via-surface dark:to-transparent rounded-full blur-3xl opacity-60" />
      </div>

      <div className="container-page text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary-subtle px-4 py-1.5 text-sm font-medium text-primary mb-8">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          {t('badge')}
        </div>

        <h1 className="mx-auto max-w-4xl text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-fg leading-[1.05]">
          {t('title')}{' '}
          <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            {t('titleHighlight')}
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-fg-muted leading-relaxed">
          {t('description')}
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={`${DASHBOARD_URL}/signup`}
            onClick={() => trackEvent('hero_cta_clicked')}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 hover:bg-primary-hover transition-colors"
          >
            {tc('startFree')}
            <ArrowIcon />
          </a>
          <Link
            href="/pricing"
            onClick={() => trackEvent('hero_plans_clicked')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline transition-colors group"
          >
            {t('ctaSecondary')}
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
        </div>

        <p className="mt-4 text-xs text-fg-subtle">{t('disclaimer')}</p>
      </div>
    </section>
  )
}
