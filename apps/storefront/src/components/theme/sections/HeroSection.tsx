import Link from 'next/link'
import Image from 'next/image'
import type { HeroSectionProps } from '@/lib/theme'

interface HeroSectionComponentProps {
  props: HeroSectionProps
  storeName: string
}

export function HeroSection({ props, storeName }: HeroSectionComponentProps) {
  const { image, headline, subtitle, ctaLabel, ctaTarget, collectionId, overlayOpacity } = props

  const ctaHref =
    ctaTarget === 'collection' && collectionId
      ? `/products?categoryId=${collectionId}`
      : '/products'

  return (
    <section className="relative flex items-center justify-center min-h-[480px] overflow-hidden">
      {/* Background */}
      {image ? (
        <>
          <Image
            src={image}
            alt={storeName}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: overlayOpacity }}
            aria-hidden="true"
          />
        </>
      ) : (
        <div className="absolute inset-0 bg-[var(--color-surface)]" aria-hidden="true" />
      )}

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        <h1
          className="text-4xl font-bold tracking-tight sm:text-5xl"
          style={{
            color: image ? '#ffffff' : 'var(--color-text)',
            fontFamily: 'var(--font-heading)',
          }}
        >
          {headline}
        </h1>

        {subtitle && (
          <p
            className="mt-4 text-lg"
            style={{ color: image ? 'rgba(255,255,255,0.85)' : 'var(--color-text-muted)' }}
          >
            {subtitle}
          </p>
        )}

        <div className="mt-8">
          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center px-6 py-3 rounded font-medium text-sm transition-opacity hover:opacity-90"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              borderRadius: 'var(--radius)',
            }}
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  )
}
