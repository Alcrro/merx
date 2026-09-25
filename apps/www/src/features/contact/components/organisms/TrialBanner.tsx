'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { DASHBOARD_URL } from '@/config/nav'
import { trackEvent } from '@/lib/analytics'
import { ArrowIcon } from '@/components/atoms/ArrowIcon'
import { SECTION_GRADIENT, ORB_CLS, CARD_CLS, CTA_CLS } from '../styles/trialBanner.styles'

export function TrialBanner() {
  const t = useTranslations('contact')
  const perks = t.raw('trialPerks') as string[]

  return (
    <section className="relative py-24 overflow-x-clip" style={{ background: SECTION_GRADIENT }}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className={ORB_CLS.left} />
        <div className={ORB_CLS.right} />
      </div>

      <div className="container-page relative">
        <div className={CARD_CLS}>
          <p className="text-2xl font-bold text-fg mb-2">{t('trial.title')}</p>
          <p className="text-sm text-fg-muted mb-8">{perks.join(' · ')}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={`${DASHBOARD_URL}/signup`}
              onClick={() => trackEvent('contact_trial_cta_clicked')}
              className={CTA_CLS}
            >
              {t('trial.cta')}
              <ArrowIcon size={15} />
            </a>
            <Link href="/pricing" className="text-sm font-semibold text-fg-muted hover:text-fg transition-colors">
              {t('trial.ctaSecondary')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
