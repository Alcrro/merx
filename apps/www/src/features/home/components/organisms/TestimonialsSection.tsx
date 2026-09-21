import { getTranslations } from 'next-intl/server'
import { TestimonialsCarousel } from './TestimonialsCarousel'

interface Testimonial {
  quote: string
  name: string
  role: string
  company: string
  metric: string
  initials: string
}

export async function TestimonialsSection() {
  const t = await getTranslations('home.testimonials')
  const items = t.raw('items') as Testimonial[]

  return (
    <section className="section-py bg-surface border-t border-line overflow-hidden">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center mb-14">
          <h2 className="text-heading-xl">{t('title')}</h2>
          <p className="mt-4 text-fg-muted leading-relaxed">{t('description')}</p>
        </div>
        <TestimonialsCarousel items={items} />
      </div>
    </section>
  )
}
