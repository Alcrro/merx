import type {
  ThemeSection,
  HeroSection,
  FeaturedProductsSection,
  BannerSection,
  TestimonialsSection,
  CollectionGridSection,
} from '@merx/api-client'

interface Props {
  section: ThemeSection
  onChange: (section: ThemeSection) => void
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</label>
      {children}
    </div>
  )
}

const inputCls =
  'w-full px-2.5 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500'

const selectCls = inputCls

function HeroEditor({ section, onChange }: { section: HeroSection; onChange: (s: HeroSection) => void }) {
  const p = section.props

  function set<K extends keyof HeroSection['props']>(key: K, value: HeroSection['props'][K]) {
    onChange({ ...section, props: { ...p, [key]: value } })
  }

  return (
    <div className="flex flex-col gap-3">
      <Field label="Titlu principal">
        <input
          className={inputCls}
          value={p.headline}
          onChange={(e) => set('headline', e.target.value)}
          placeholder="ex: Colecția de vară"
        />
      </Field>
      <Field label="Subtitlu">
        <input
          className={inputCls}
          value={p.subtitle ?? ''}
          onChange={(e) => set('subtitle', e.target.value || null)}
          placeholder="ex: Explorează noile sosiri"
        />
      </Field>
      <Field label="Text buton CTA">
        <input
          className={inputCls}
          value={p.ctaLabel}
          onChange={(e) => set('ctaLabel', e.target.value)}
          placeholder="ex: Cumpără acum"
        />
      </Field>
      <Field label="Destinație CTA">
        <select
          className={selectCls}
          value={p.ctaTarget}
          onChange={(e) => set('ctaTarget', e.target.value as HeroSection['props']['ctaTarget'])}
        >
          <option value="shop">Toate produsele</option>
          <option value="collection">Colecție specifică</option>
        </select>
      </Field>
      {p.ctaTarget === 'collection' && (
        <Field label="ID colecție">
          <input
            className={inputCls}
            value={p.collectionId ?? ''}
            onChange={(e) => set('collectionId', e.target.value || null)}
            placeholder="ID colecție"
          />
        </Field>
      )}
      <Field label={`Opacitate overlay imagine: ${Math.round(p.overlayOpacity * 100)}%`}>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={p.overlayOpacity}
          onChange={(e) => set('overlayOpacity', parseFloat(e.target.value))}
          className="w-full accent-indigo-600"
        />
      </Field>
    </div>
  )
}

function FeaturedProductsEditor({
  section,
  onChange,
}: {
  section: FeaturedProductsSection
  onChange: (s: FeaturedProductsSection) => void
}) {
  const p = section.props

  function set<K extends keyof FeaturedProductsSection['props']>(
    key: K,
    value: FeaturedProductsSection['props'][K],
  ) {
    onChange({ ...section, props: { ...p, [key]: value } })
  }

  return (
    <div className="flex flex-col gap-3">
      <Field label="Titlu secțiune">
        <input
          className={inputCls}
          value={p.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="ex: Noutăți"
        />
      </Field>
      <Field label="Sursă produse">
        <select
          className={selectCls}
          value={p.source}
          onChange={(e) =>
            set('source', e.target.value as FeaturedProductsSection['props']['source'])
          }
        >
          <option value="new_arrivals">Sosiri recente</option>
          <option value="collection">Colecție specifică</option>
          <option value="manual">Manual</option>
        </select>
      </Field>
      {p.source === 'collection' && (
        <Field label="ID colecție">
          <input
            className={inputCls}
            value={p.collectionId ?? ''}
            onChange={(e) => set('collectionId', e.target.value || null)}
            placeholder="ID colecție"
          />
        </Field>
      )}
      <Field label={`Număr produse afișate: ${p.limit}`}>
        <input
          type="range"
          min={2}
          max={12}
          step={2}
          value={p.limit}
          onChange={(e) => set('limit', parseInt(e.target.value, 10))}
          className="w-full accent-indigo-600"
        />
      </Field>
    </div>
  )
}

function BannerEditor({
  section,
  onChange,
}: {
  section: BannerSection
  onChange: (s: BannerSection) => void
}) {
  const p = section.props

  function set<K extends keyof BannerSection['props']>(key: K, value: BannerSection['props'][K]) {
    onChange({ ...section, props: { ...p, [key]: value } })
  }

  return (
    <div className="flex flex-col gap-3">
      <Field label="Text banner">
        <textarea
          className={`${inputCls} resize-none`}
          rows={2}
          value={p.text}
          onChange={(e) => set('text', e.target.value)}
          placeholder="ex: Livrare gratuită la comenzi peste 200 RON"
        />
      </Field>
      <Field label="Text buton (opțional)">
        <input
          className={inputCls}
          value={p.ctaLabel ?? ''}
          onChange={(e) => set('ctaLabel', e.target.value || null)}
          placeholder="ex: Află mai mult"
        />
      </Field>
      <Field label="URL buton (opțional)">
        <input
          className={inputCls}
          value={p.ctaUrl ?? ''}
          onChange={(e) => set('ctaUrl', e.target.value || null)}
          placeholder="ex: /produse"
        />
      </Field>
    </div>
  )
}

function TestimonialsEditor({
  section,
  onChange,
}: {
  section: TestimonialsSection
  onChange: (s: TestimonialsSection) => void
}) {
  const p = section.props
  const items = p.items

  function setTitle(title: string) {
    onChange({ ...section, props: { ...p, title } })
  }

  function setItem(
    index: number,
    key: keyof TestimonialsSection['props']['items'][number],
    value: string | number,
  ) {
    const next = items.map((item, i) => (i === index ? { ...item, [key]: value } : item))
    onChange({ ...section, props: { ...p, items: next } })
  }

  function addItem() {
    onChange({
      ...section,
      props: { ...p, items: [...items, { author: '', text: '', rating: 5 }] },
    })
  }

  function removeItem(index: number) {
    onChange({ ...section, props: { ...p, items: items.filter((_, i) => i !== index) } })
  }

  return (
    <div className="flex flex-col gap-3">
      <Field label="Titlu secțiune">
        <input
          className={inputCls}
          value={p.title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="ex: Ce spun clienții noștri"
        />
      </Field>

      {items.map((item, i) => (
        <div key={i} className="flex flex-col gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Testimonial {i + 1}
            </span>
            <button
              onClick={() => removeItem(i)}
              className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400"
            >
              Șterge
            </button>
          </div>
          <input
            className={inputCls}
            value={item.author}
            onChange={(e) => setItem(i, 'author', e.target.value)}
            placeholder="Nume client"
          />
          <textarea
            className={`${inputCls} resize-none`}
            rows={2}
            value={item.text}
            onChange={(e) => setItem(i, 'text', e.target.value)}
            placeholder="Textul recenziei"
          />
          <Field label={`Rating: ${item.rating}/5`}>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={item.rating}
              onChange={(e) => setItem(i, 'rating', parseInt(e.target.value, 10))}
              className="w-full accent-indigo-600"
            />
          </Field>
        </div>
      ))}

      <button
        onClick={addItem}
        className="w-full py-1.5 text-sm text-indigo-600 dark:text-indigo-400 border border-dashed border-indigo-300 dark:border-indigo-700 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
      >
        + Adaugă testimonial
      </button>
    </div>
  )
}

function CollectionGridEditor({
  section,
  onChange,
}: {
  section: CollectionGridSection
  onChange: (s: CollectionGridSection) => void
}) {
  const p = section.props

  function set<K extends keyof CollectionGridSection['props']>(
    key: K,
    value: CollectionGridSection['props'][K],
  ) {
    onChange({ ...section, props: { ...p, [key]: value } })
  }

  return (
    <div className="flex flex-col gap-3">
      <Field label="Titlu secțiune">
        <input
          className={inputCls}
          value={p.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="ex: Colecțiile noastre"
        />
      </Field>
      <Field label={`Număr colecții afișate: ${p.limit}`}>
        <input
          type="range"
          min={2}
          max={8}
          step={2}
          value={p.limit}
          onChange={(e) => set('limit', parseInt(e.target.value, 10))}
          className="w-full accent-indigo-600"
        />
      </Field>
    </div>
  )
}

export function SectionPropsEditor({ section, onChange }: Props) {
  switch (section.type) {
    case 'hero':
      return <HeroEditor section={section} onChange={onChange} />
    case 'featuredProducts':
      return <FeaturedProductsEditor section={section} onChange={onChange} />
    case 'banner':
      return <BannerEditor section={section} onChange={onChange} />
    case 'testimonials':
      return <TestimonialsEditor section={section} onChange={onChange} />
    case 'collectionGrid':
      return <CollectionGridEditor section={section} onChange={onChange} />
  }
}
