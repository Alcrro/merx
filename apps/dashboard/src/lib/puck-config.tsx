import type { Config } from '@measured/puck'

// ─── Prop types ───────────────────────────────────────────────────────────────

type HeroProps = {
  headline: string
  subtitle: string
  ctaLabel: string
  ctaTarget: 'shop' | 'collection'
  collectionId: string
  overlayOpacity: number
  image: string
}

type FeaturedProductsProps = {
  title: string
  source: 'new_arrivals' | 'collection' | 'manual'
  collectionId: string
  limit: number
}

type BannerProps = {
  text: string
  ctaLabel: string
  ctaUrl: string
}

type TestimonialsProps = {
  title: string
  items: { author: string; text: string; rating: number }[]
}

type CollectionGridProps = {
  title: string
  limit: number
}

// ─── Shared preview styles ────────────────────────────────────────────────────

const primaryBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '10px 24px',
  backgroundColor: 'var(--color-primary, #4f46e5)',
  color: '#fff',
  borderRadius: 'var(--radius, 6px)',
  fontSize: 14,
  fontWeight: 500,
  textDecoration: 'none',
  cursor: 'pointer',
}

const sectionHeading: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 600,
  color: 'var(--color-text, #111827)',
  fontFamily: 'var(--font-heading, inherit)',
  margin: 0,
}

// ─── Config ───────────────────────────────────────────────────────────────────

export const puckConfig = {
  categories: {
    layout: {
      title: 'Layout',
      components: ['Hero', 'Banner'],
    },
    produse: {
      title: 'Produse',
      components: ['FeaturedProducts', 'CollectionGrid'],
    },
    social: {
      title: 'Social',
      components: ['Testimonials'],
    },
  },

  components: {
    Hero: {
      label: 'Hero',
      fields: {
        headline: { type: 'text', label: 'Titlu principal' },
        subtitle: { type: 'text', label: 'Subtitlu' },
        image: { type: 'text', label: 'URL imagine fundal' },
        ctaLabel: { type: 'text', label: 'Text buton' },
        ctaTarget: {
          type: 'select',
          label: 'Destinație buton',
          options: [
            { label: 'Toate produsele', value: 'shop' },
            { label: 'Colecție specifică', value: 'collection' },
          ],
        },
        collectionId: { type: 'text', label: 'ID colecție (dacă target = collection)' },
        overlayOpacity: {
          type: 'number',
          label: 'Opacitate overlay (0–1)',
          min: 0,
          max: 1,
          step: 0.05,
        },
      },
      defaultProps: {
        headline: 'Titlul magazinului tău',
        subtitle: 'Explorează colecția noastră',
        image: '',
        ctaLabel: 'Cumpără acum',
        ctaTarget: 'shop' as const,
        collectionId: '',
        overlayOpacity: 0.4,
      },
      render: ({ headline, subtitle, image, ctaLabel, overlayOpacity }) => (
        <section
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 480,
            overflow: 'hidden',
            backgroundColor: image ? 'transparent' : 'var(--color-surface, #f9fafb)',
          }}
        >
          {image && (
            <>
              <img
                src={image}
                alt=""
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'black',
                  opacity: overlayOpacity,
                }}
              />
            </>
          )}
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 16px', maxWidth: 700 }}>
            <h1
              style={{
                fontSize: 48,
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: image ? '#fff' : 'var(--color-text, #111827)',
                fontFamily: 'var(--font-heading, inherit)',
                margin: '0 0 16px',
              }}
            >
              {headline}
            </h1>
            {subtitle && (
              <p
                style={{
                  fontSize: 18,
                  color: image ? 'rgba(255,255,255,0.85)' : 'var(--color-text-muted, #6b7280)',
                  margin: '0 0 32px',
                }}
              >
                {subtitle}
              </p>
            )}
            <a href="#" style={primaryBtn}>
              {ctaLabel}
            </a>
          </div>
        </section>
      ),
    },

    FeaturedProducts: {
      label: 'Produse recomandate',
      fields: {
        title: { type: 'text', label: 'Titlu secțiune' },
        source: {
          type: 'select',
          label: 'Sursă produse',
          options: [
            { label: 'Sosiri recente', value: 'new_arrivals' },
            { label: 'Colecție specifică', value: 'collection' },
            { label: 'Manual', value: 'manual' },
          ],
        },
        collectionId: { type: 'text', label: 'ID colecție (dacă sursă = collection)' },
        limit: { type: 'number', label: 'Număr produse', min: 2, max: 12, step: 2 },
      },
      defaultProps: {
        title: 'Noutăți',
        source: 'new_arrivals' as const,
        collectionId: '',
        limit: 4,
      },
      render: ({ title, limit }) => (
        <section style={{ padding: '64px 32px', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <h2 style={sectionHeading}>{title}</h2>
            <span style={{ fontSize: 14, color: 'var(--color-text-muted, #6b7280)' }}>
              Vezi toate →
            </span>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.min(limit, 4)}, 1fr)`,
              gap: 24,
            }}
          >
            {Array.from({ length: limit }).map((_, i) => (
              <div
                key={i}
                style={{
                  aspectRatio: '3/4',
                  borderRadius: 'var(--radius, 6px)',
                  backgroundColor: 'var(--color-surface, #f3f4f6)',
                }}
              />
            ))}
          </div>
        </section>
      ),
    },

    Banner: {
      label: 'Banner',
      fields: {
        text: { type: 'textarea', label: 'Text banner' },
        ctaLabel: { type: 'text', label: 'Text buton (opțional)' },
        ctaUrl: { type: 'text', label: 'URL buton (opțional)' },
      },
      defaultProps: {
        text: 'Livrare gratuită la comenzi peste 200 RON',
        ctaLabel: '',
        ctaUrl: '',
      },
      render: ({ text, ctaLabel, ctaUrl }) => (
        <div
          style={{
            backgroundColor: 'var(--color-primary, #4f46e5)',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <p style={{ margin: 0, color: '#fff', fontSize: 14, fontWeight: 500, textAlign: 'center' }}>
            {text}
          </p>
          {ctaLabel && (
            <a
              href={ctaUrl || '#'}
              style={{
                ...primaryBtn,
                backgroundColor: '#fff',
                color: 'var(--color-primary, #4f46e5)',
                padding: '6px 16px',
                fontSize: 13,
              }}
            >
              {ctaLabel}
            </a>
          )}
        </div>
      ),
    },

    Testimonials: {
      label: 'Testimoniale',
      fields: {
        title: { type: 'text', label: 'Titlu secțiune' },
        items: {
          type: 'array',
          label: 'Testimoniale',
          arrayFields: {
            author: { type: 'text', label: 'Autor' },
            text: { type: 'textarea', label: 'Text recenzie' },
            rating: { type: 'number', label: 'Rating (1–5)', min: 1, max: 5, step: 1 },
          },
          getItemSummary: (item) => (item as { author: string }).author || 'Testimonial',
        },
      },
      defaultProps: {
        title: 'Ce spun clienții noștri',
        items: [
          { author: 'Maria P.', text: 'Produse excelente, livrare rapidă!', rating: 5 },
          { author: 'Andrei M.', text: 'Calitate foarte bună, recomand cu încredere.', rating: 5 },
        ],
      },
      render: ({ title, items }) => (
        <section style={{ padding: '64px 32px', maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ ...sectionHeading, textAlign: 'center', marginBottom: 48 }}>{title}</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.min(items.length || 1, 3)}, 1fr)`,
              gap: 24,
            }}
          >
            {(items as { author: string; text: string; rating: number }[]).map((item, i) => (
              <div
                key={i}
                style={{
                  padding: 24,
                  borderRadius: 'var(--radius, 6px)',
                  backgroundColor: 'var(--color-surface, #f9fafb)',
                  border: '1px solid #e5e7eb',
                }}
              >
                <p style={{ margin: '0 0 16px', color: 'var(--color-text, #111827)', fontSize: 14, lineHeight: 1.6 }}>
                  "{item.text}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-primary, #4f46e5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    {item.author[0]}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--color-text, #111827)' }}>
                      {item.author}
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-muted, #6b7280)' }}>
                      {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ),
    },

    CollectionGrid: {
      label: 'Grid colecții',
      fields: {
        title: { type: 'text', label: 'Titlu secțiune' },
        limit: { type: 'number', label: 'Număr colecții', min: 2, max: 8, step: 2 },
      },
      defaultProps: {
        title: 'Colecțiile noastre',
        limit: 4,
      },
      render: ({ title, limit }) => (
        <section style={{ padding: '64px 32px', maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ ...sectionHeading, marginBottom: 32 }}>{title}</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.min(limit, 4)}, 1fr)`,
              gap: 16,
            }}
          >
            {Array.from({ length: limit }).map((_, i) => (
              <div
                key={i}
                style={{
                  aspectRatio: '1/1',
                  borderRadius: 'var(--radius, 6px)',
                  backgroundColor: 'var(--color-surface, #f3f4f6)',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: 16,
                }}
              >
                <div
                  style={{
                    height: 20,
                    width: '60%',
                    borderRadius: 4,
                    backgroundColor: 'var(--color-text-muted, #d1d5db)',
                    opacity: 0.5,
                  }}
                />
              </div>
            ))}
          </div>
        </section>
      ),
    },
  },
} satisfies Config
