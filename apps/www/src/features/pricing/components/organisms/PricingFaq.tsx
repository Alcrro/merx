'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { FaqItem } from '../molecules/FaqItem'
import { trackEvent } from '@/lib/analytics'

interface FaqEntry {
  q: string
  a: string
}

export function PricingFaq() {
  const t = useTranslations('pricing.faq')
  const items = t.raw('items') as FaqEntry[]
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  function handleToggle(i: number) {
    const opening = openIndex !== i
    setOpenIndex(opening ? i : null)
    if (opening) trackEvent('pricing_faq_opened', { question_index: i })
  }

  return (
    <section className="border-t border-line py-20 bg-surface">
      <div className="mx-auto max-w-2xl px-5 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-fg">{t('heading')}</h2>
          <p className="mt-2 text-sm text-fg-muted">{t('subheading')}</p>
        </div>
        <div className="flex flex-col gap-3">
          {items.map((item, i) => (
            <FaqItem
              key={item.q}
              id={String(i)}
              q={item.q}
              a={item.a}
              open={openIndex === i}
              onToggle={() => handleToggle(i)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
