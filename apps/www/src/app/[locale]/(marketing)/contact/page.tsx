import { getTranslations } from 'next-intl/server'
import { CHANNEL_KEYS } from '@/features/contact/config'
import type { ContactChannel } from '@/features/contact/config'
import { jsonLd } from '@/features/contact/seo'
import { ContactForm } from '@/features/contact/components/organisms/ContactForm'
import { ContactChannels } from '@/features/contact/components/molecules/ContactChannels'
import { ContactFaq } from '@/features/contact/components/molecules/ContactFaq'
import { ContactTrustSignals } from '@/features/contact/components/molecules/ContactTrustSignals'
import { TrialBanner } from '@/features/contact/components/organisms/TrialBanner'

export { metadata } from '@/features/contact/seo'

type ChannelKey = 'sales' | 'support' | 'legal' | 'press'

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>
}) {
  const [t, params] = await Promise.all([getTranslations('contact'), searchParams])
  const initialTopic = params.topic

  const channels: ContactChannel[] = CHANNEL_KEYS.map((c) => {
    const key = c.key as ChannelKey
    return {
      key: c.key,
      email: c.email,
      label: t(`channels.items.${key}.label`),
      description: t(`channels.items.${key}.description`),
      responseTime: t(`channels.items.${key}.responseTime`),
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

      <ContactTrustSignals />

      <section className="pb-20">
        <div className="container-page">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start max-w-5xl mx-auto">
            <div id="form" className="bg-surface-elevated rounded-2xl p-8 shadow-[0_0_24px_rgba(0,0,0,0.08)]">
              <h2 className="text-lg font-bold text-fg mb-6">{t('form.sendTitle')}</h2>
              <ContactForm initialTopic={initialTopic} />
            </div>
            <ContactChannels channels={channels} />
          </div>
        </div>
      </section>

      <TrialBanner />

      <ContactFaq />
    </>
  )
}
