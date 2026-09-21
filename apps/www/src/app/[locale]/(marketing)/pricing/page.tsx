import { getTranslations } from 'next-intl/server'
import { jsonLd } from '@/features/pricing/seo'
import { DASHBOARD_URL } from '@/config/nav'
import { BASE_PLAN_DATA, type PricingPlan, type PricingFeature } from '@/features/pricing/config'
import { getAccountUser } from '@/services/account'
import { PricingCard } from '@/features/pricing/components/molecules/PricingCard'
import { PricingStats } from '@/features/pricing/components/molecules/PricingStats'
import { PricingGuarantees } from '@/features/pricing/components/molecules/PricingGuarantees'
import { PricingFaq } from '@/features/pricing/components/organisms/PricingFaq'
import { PricingCta } from '@/features/pricing/components/organisms/PricingCta'

export { metadata } from '@/features/pricing/seo'

type PlanKey = 'starter' | 'pro' | 'scale' | 'enterprise'

async function getCurrentPlanId(): Promise<string | null> {
  try {
    const user = await getAccountUser()
    return user?.planId ?? null
  } catch {
    return null
  }
}

export default async function PricingPage() {
  const [t, currentPlanId] = await Promise.all([
    getTranslations('pricing'),
    getCurrentPlanId(),
  ])

  const plans: PricingPlan[] = BASE_PLAN_DATA.map((base) => {
    const key = base.id as PlanKey
    return {
      id: base.id,
      name: base.name,
      description: t(`plans.${key}.description` as 'plans.starter.description'),
      price: base.price,
      trial: base.hasTrial ? t(`plans.${key}.trial` as 'plans.starter.trial') : null,
      highlight: base.highlight,
      features: t.raw(`plans.${key}.features` as 'plans.starter.features') as PricingFeature[],
      cta: {
        label: t(`plans.${key}.cta` as 'plans.starter.cta'),
        href: base.href,
      },
    }
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="pt-20 pb-12 text-center bg-surface">
        <div className="container-page">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-fg">
            {t('hero.title')}
          </h1>
          <p className="mt-4 text-lg text-fg-muted max-w-xl mx-auto">
            {t('hero.description')}
          </p>
        </div>
      </section>

      <PricingStats />

      <section className="pb-20 bg-surface" aria-label={t('plansSection.ariaLabel')}>
        <div className="container-page">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {plans.map((plan) => (
              <PricingCard key={plan.id} plan={plan} currentPlanId={currentPlanId} />
            ))}
          </div>
        </div>
      </section>

      <PricingGuarantees />

      <PricingFaq />

      <PricingCta signupUrl={`${DASHBOARD_URL}/signup`} />
    </>
  )
}
