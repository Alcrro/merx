import { getTranslations } from 'next-intl/server'
import { CheckIcon } from '@/components/atoms/CheckIcon'
import { FEATURE_CONFIGS } from '@/features/home/config'

interface FeatureText {
  badge: string
  headline: string
  sub: string
  items: string[]
}

export async function FeaturesSection() {
  const t = await getTranslations('home')
  const featureTexts = t.raw('features') as FeatureText[]

  return (
    <section className="section-py bg-surface">
      <div className="container-page space-y-32">
        {FEATURE_CONFIGS.map((config, i) => {
          const text = featureTexts[i]
          return (
            <div
              key={config.id}
              id={config.id}
              className={`flex flex-col ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-20`}
            >
              <div className="flex-1 max-w-lg">
                <span className="inline-block rounded-full bg-primary-subtle px-3 py-1 text-xs font-semibold text-primary mb-4">
                  {text.badge}
                </span>
                <h2 className="text-heading-xl">{text.headline}</h2>
                <p className="mt-4 text-fg-muted text-base leading-relaxed">{text.sub}</p>
                <ul className="mt-6 space-y-2.5">
                  {text.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-fg-muted">
                      <span className="mt-0.5 flex-shrink-0 text-primary"><CheckIcon /></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 w-full max-w-lg">{config.visual}</div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
