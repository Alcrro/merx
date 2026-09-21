'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { FaqItem } from '@/features/pricing/components/molecules/FaqItem'
import { trackEvent } from '@/lib/analytics'

interface FaqEntry {
  q: string
  a: string
}

export function ContactFaq() {
  const t = useTranslations('contact')
  const items = t.raw('faq.items') as FaqEntry[]
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  function handleToggle(i: number) {
    const opening = openIndex !== i
    setOpenIndex(opening ? i : null)
    if (opening) trackEvent('contact_faq_opened', { question_index: i })
  }

  return (
    <section className="border-t border-line py-16" style={{ background: 'linear-gradient(to bottom, transparent 40%, var(--color-surface) 100%)' }}>
      <div className="container-page">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-lg font-bold text-fg mb-6">{t('faq.heading')}</h2>
          <div className="flex flex-col gap-3">
            {items.map((item, i) => (
              <FaqItem
                key={item.q}
                id={`contact-${i}`}
                q={item.q}
                a={item.a}
                open={openIndex === i}
                onToggle={() => handleToggle(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
