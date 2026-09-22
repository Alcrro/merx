import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { BASE_URL, buildJsonLd } from '@/features/marketplace/seo'
import { MarketplaceHero } from '@/features/marketplace/components/organisms/MarketplaceHero'
import { MarketplaceFeaturesSection } from '@/features/marketplace/components/organisms/MarketplaceFeaturesSection'
import { MarketplaceFinalCta } from '@/features/marketplace/components/organisms/MarketplaceFinalCta'

interface StatItem { value: string; label: string }
interface StepItem { step: string; title: string; body: string }

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations('marketplace.seo')
  const description = t('description')
  const localePath = locale === 'en' ? '' : `/${locale}`
  const pageUrl = `${BASE_URL}${localePath}/marketplace`

  return {
    title: t('title'),
    description,
    keywords: ['marketplace merx', 'teme magazin online', 'integrări ecommerce', 'plugin-uri merx'],
    alternates: {
      canonical: pageUrl,
      languages: {
        'en': `${BASE_URL}/marketplace`,
        'ro': `${BASE_URL}/ro/marketplace`,
        'x-default': `${BASE_URL}/marketplace`,
      },
    },
    openGraph: {
      title: t('ogTitle'),
      description,
      url: pageUrl,
      siteName: 'Merx',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('ogTitle'),
      description,
    },
    robots: { index: true, follow: true },
  }
}

export default async function MarketplacePage() {
  const t = await getTranslations('marketplace')
  const stats = t.raw('stats') as StatItem[]
  const steps = t.raw('howItWorks.steps') as StepItem[]

  const jsonLd = buildJsonLd({
    description: t('seo.schemaDescription'),
    offerDescription: t('seo.offerDescription'),
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <MarketplaceHero />

      <section className="border-y border-line bg-surface-subtle py-10">
        <div className="container-page">
          <ul className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center list-none">
            {stats.map((s) => (
              <li key={s.label}>
                <p className="text-3xl font-extrabold text-fg">{s.value}</p>
                <p className="mt-1 text-sm text-fg-muted">{s.label}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section-py bg-surface">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-heading-xl">{t('howItWorks.title')}</h2>
            <p className="mt-4 text-fg-muted leading-relaxed">{t('howItWorks.description')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.step} className="rounded-2xl border border-line-strong bg-surface-elevated p-6 shadow-md dark:shadow-none">
                <span className="text-4xl font-extrabold text-primary/20 block mb-4">{step.step}</span>
                <h3 className="font-semibold text-fg mb-2">{step.title}</h3>
                <p className="text-sm text-fg-muted leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <MarketplaceFeaturesSection />
      <MarketplaceFinalCta />
    </>
  )
}
