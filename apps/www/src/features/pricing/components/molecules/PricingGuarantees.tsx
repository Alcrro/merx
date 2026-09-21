import { getTranslations } from 'next-intl/server'
import { CheckIcon } from '@/components/atoms/CheckIcon'

export async function PricingGuarantees() {
  const t = await getTranslations('pricing')
  const guarantees = t.raw('guarantees') as string[]

  return (
    <section className="pb-16 bg-surface">
      <div className="container-page">
        <ul className="flex flex-wrap justify-center gap-x-8 gap-y-3">
          {guarantees.map((g) => (
            <li key={g} className="flex items-center gap-2 text-sm text-fg-muted">
              <CheckIcon className="text-success" size={14} />
              {g}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
