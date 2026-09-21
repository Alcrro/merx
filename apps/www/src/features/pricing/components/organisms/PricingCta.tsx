'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { trackEvent } from '@/lib/analytics'
import { ArrowIcon } from '@/components/atoms/ArrowIcon'
import { CheckIcon } from '@/components/atoms/CheckIcon'

interface PricingCtaProps {
  signupUrl: string
}

export function PricingCta({ signupUrl }: PricingCtaProps) {
  const t = useTranslations('pricing.cta')
  const tp = useTranslations('pricing')
  const perks = tp.raw('trialPerks') as string[]

  return (
    <section className="relative py-24 overflow-hidden border-t border-line bg-surface">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/4 -translate-y-1/2 w-[500px] h-[300px] rounded-full bg-primary/8 dark:bg-primary/15 blur-[90px]" />
        <div className="absolute bottom-0 right-1/4 translate-y-1/2 w-[400px] h-[250px] rounded-full bg-violet-500/6 dark:bg-violet-500/12 blur-[80px]" />
      </div>

      <div className="container-page relative text-center">
        <p className="text-eyebrow text-primary mb-4">{t('badge')}</p>

        <h2 className="text-3xl sm:text-4xl font-extrabold text-fg mb-4">{t('title')}</h2>

        <p className="text-sm text-fg-muted max-w-sm mx-auto mb-10 leading-relaxed">{t('description')}</p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <a
            href={signupUrl}
            onClick={() => trackEvent('pricing_bottom_cta_clicked')}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md shadow-primary/25 hover:bg-primary-hover transition-colors"
          >
            {t('cta')}
            <ArrowIcon size={14} />
          </a>
          <Link href="/contact" className="text-sm font-semibold text-fg-muted hover:text-fg transition-colors">
            {t('ctaSecondary')}
          </Link>
        </div>

        <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {perks.map((perk) => (
            <li key={perk} className="flex items-center gap-1.5 text-xs text-fg-subtle">
              <CheckIcon size={11} className="text-primary" />
              {perk}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
