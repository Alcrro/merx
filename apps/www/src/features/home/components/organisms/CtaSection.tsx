'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { DASHBOARD_URL } from '@/config/nav'
import { ArrowIcon } from '@/components/atoms/ArrowIcon'
import { CheckCircleIcon } from '@/components/atoms/CheckCircleIcon'
import { trackEvent } from '@/lib/analytics'

export function CtaSection() {
  const t = useTranslations('home.cta')
  const tc = useTranslations('common')
  const benefits = t.raw('benefits') as string[]

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 section-py">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute top-1/2 -translate-y-1/2 left-0 w-[300px] h-[300px] rounded-full bg-white/5 blur-2xl" />
      </div>

      <div className="container-page relative text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90 mb-8">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
          </span>
          {t('badge')}
        </div>

        <h2 className="mx-auto max-w-2xl text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.1]">
          {t('title')}
        </h2>

        <p className="mt-5 mx-auto max-w-lg text-lg text-white/80 leading-relaxed">
          {t('description')}
        </p>

        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex items-center gap-2 text-sm text-white/80">
              <span className="text-white/60"><CheckCircleIcon /></span>
              {benefit}
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={`${DASHBOARD_URL}/signup`}
            onClick={() => trackEvent('home_final_cta_clicked')}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-primary hover:bg-primary-subtle transition-colors shadow-xl shadow-black/20"
          >
            {tc('startFree')}
            <ArrowIcon />
          </a>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/80 hover:text-white transition-colors group"
          >
            {t('ctaSecondary')}
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
        </div>

        <p className="mt-5 text-xs text-white/50">{t('disclaimer')}</p>
      </div>
    </section>
  )
}
