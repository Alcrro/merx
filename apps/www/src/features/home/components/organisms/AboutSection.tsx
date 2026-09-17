import { getTranslations } from 'next-intl/server'

interface AboutCard {
  title: string
  body: string
}

export async function AboutSection() {
  const t = await getTranslations('home.about')
  const cards = t.raw('cards') as AboutCard[]

  return (
    <section id="about" className="border-t border-line bg-surface-subtle section-py">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-heading-xl">{t('title')}</h2>
          <p className="mt-4 text-fg-muted leading-relaxed">{t('description')}</p>
        </div>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card) => (
            <div key={card.title} className="rounded-2xl border border-line-strong bg-surface-elevated p-6 shadow-md dark:shadow-none">
              <h3 className="font-semibold text-fg mb-2">{card.title}</h3>
              <p className="text-sm text-fg-muted leading-relaxed">{card.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
