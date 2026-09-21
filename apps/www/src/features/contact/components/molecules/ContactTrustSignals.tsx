import { getTranslations } from 'next-intl/server'
import { CheckIcon } from '@/components/atoms/CheckIcon'

export async function ContactTrustSignals() {
  const t = await getTranslations('contact')
  const signals = t.raw('trustSignals') as string[]

  return (
    <section className="border-y border-line bg-surface py-4 mb-4" aria-label="Garanții">
      <div className="container-page">
        <ul className="flex flex-wrap justify-center gap-x-8 gap-y-2">
          {signals.map((label) => (
            <li key={label} className="flex items-center gap-2 text-sm text-fg-muted">
              <CheckIcon size={14} className="text-primary flex-shrink-0" />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
