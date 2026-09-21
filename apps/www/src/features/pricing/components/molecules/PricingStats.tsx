import { getTranslations } from 'next-intl/server'

interface Stat {
  value: string
  label: string
}

export async function PricingStats() {
  const t = await getTranslations('pricing.socialProof')
  const stats = t.raw('stats') as Stat[]

  return (
    <section className="pb-10 bg-surface">
      <div className="container-page text-center">
        <p className="text-sm font-semibold text-fg-muted mb-6">{t('headline')}</p>
        <ul className="flex flex-wrap justify-center gap-10">
          {stats.map((s) => (
            <li key={s.label}>
              <p className="text-3xl font-extrabold text-fg">{s.value}</p>
              <p className="text-xs text-fg-subtle mt-1">{s.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
