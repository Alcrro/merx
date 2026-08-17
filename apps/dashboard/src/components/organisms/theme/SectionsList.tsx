import { useRef, useState } from 'react'
import type { ThemeSection } from '@merx/api-client'
import { SectionPropsEditor } from '../../molecules/theme/SectionPropsEditor'

const SECTION_LABELS: Record<ThemeSection['type'], string> = {
  hero: 'Hero',
  featuredProducts: 'Produse recomandate',
  banner: 'Banner',
  testimonials: 'Testimoniale',
  collectionGrid: 'Grid colecții',
}

const SECTION_ICONS: Record<ThemeSection['type'], string> = {
  hero: '🖼',
  featuredProducts: '🛍',
  banner: '📢',
  testimonials: '💬',
  collectionGrid: '▦',
}

const DEFAULT_PROPS: { [K in ThemeSection['type']]: Extract<ThemeSection, { type: K }>['props'] } = {
  hero: {
    image: null,
    headline: 'Titlul tău',
    subtitle: null,
    ctaLabel: 'Cumpără acum',
    ctaTarget: 'shop',
    collectionId: null,
    overlayOpacity: 0.4,
  },
  featuredProducts: {
    title: 'Noutăți',
    source: 'new_arrivals',
    collectionId: null,
    limit: 4,
  },
  banner: {
    text: 'Ofertă specială',
    ctaLabel: null,
    ctaUrl: null,
    backgroundColor: null,
  },
  testimonials: {
    title: 'Ce spun clienții noștri',
    items: [],
  },
  collectionGrid: {
    title: 'Colecțiile noastre',
    limit: 4,
  },
}

interface SectionsListProps {
  sections: ThemeSection[]
  onChange: (sections: ThemeSection[]) => void
}

export function SectionsList({ sections, onChange }: SectionsListProps) {
  const dragIndex = useRef<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  function toggleVisible(index: number) {
    const next = sections.map((s, i) => (i === index ? { ...s, visible: !s.visible } : s))
    onChange(next)
  }

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  function handleSectionChange(updated: ThemeSection) {
    onChange(sections.map((s) => (s.id === updated.id ? updated : s)))
  }

  function onDragStart(index: number) {
    dragIndex.current = index
  }

  function onDragOver(e: React.DragEvent, index: number) {
    e.preventDefault()
    setOverIndex(index)
  }

  function onDrop(dropIndex: number) {
    const from = dragIndex.current
    if (from === null || from === dropIndex) {
      setOverIndex(null)
      return
    }
    const next = [...sections]
    const [moved] = next.splice(from, 1)
    next.splice(dropIndex, 0, moved)
    onChange(next)
    dragIndex.current = null
    setOverIndex(null)
  }

  function onDragEnd() {
    dragIndex.current = null
    setOverIndex(null)
  }

  function addSection(type: ThemeSection['type']) {
    const newSection = {
      id: `${type}-${Date.now()}`,
      type,
      visible: true,
      props: DEFAULT_PROPS[type],
    } as ThemeSection
    onChange([...sections, newSection])
    setExpandedId(newSection.id)
  }

  const presentTypes = new Set(sections.map((s) => s.type))
  const addableTypes = (Object.keys(SECTION_LABELS) as ThemeSection['type'][]).filter(
    (t) => !presentTypes.has(t),
  )

  return (
    <div className="flex flex-col gap-1">
      {sections.map((section, index) => {
        const isExpanded = expandedId === section.id

        return (
          <div key={section.id}>
            {/* Row */}
            <div
              draggable
              onDragStart={() => onDragStart(index)}
              onDragOver={(e) => onDragOver(e, index)}
              onDrop={() => onDrop(index)}
              onDragEnd={onDragEnd}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors cursor-grab active:cursor-grabbing select-none ${
                overIndex === index
                  ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                  : isExpanded
                    ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-900/10'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {/* Drag handle */}
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="currentColor" viewBox="0 0 16 16">
                <circle cx="5" cy="4" r="1.2" />
                <circle cx="11" cy="4" r="1.2" />
                <circle cx="5" cy="8" r="1.2" />
                <circle cx="11" cy="8" r="1.2" />
                <circle cx="5" cy="12" r="1.2" />
                <circle cx="11" cy="12" r="1.2" />
              </svg>

              <span className="text-base" aria-hidden="true">{SECTION_ICONS[section.type]}</span>

              <span
                className={`flex-1 text-sm font-medium ${
                  section.visible
                    ? 'text-gray-800 dark:text-gray-200'
                    : 'text-gray-400 dark:text-gray-500 line-through'
                }`}
              >
                {SECTION_LABELS[section.type]}
              </span>

              {/* Expand toggle */}
              <button
                onClick={(e) => { e.stopPropagation(); toggleExpand(section.id) }}
                aria-label={isExpanded ? 'Închide editare' : 'Editează conținut'}
                className="p-1 rounded text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
              >
                <svg
                  className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Visibility toggle */}
              <button
                onClick={(e) => { e.stopPropagation(); toggleVisible(index) }}
                aria-label={section.visible ? 'Ascunde secțiunea' : 'Afișează secțiunea'}
                className={`w-8 h-5 rounded-full transition-colors shrink-0 relative cursor-pointer ${
                  section.visible ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    section.visible ? 'translate-x-3' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Props editor panel */}
            {isExpanded && (
              <div className="mt-1 mb-2 p-3 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-gray-900">
                <SectionPropsEditor section={section} onChange={handleSectionChange} />
              </div>
            )}
          </div>
        )
      })}

      {/* Add section */}
      {addableTypes.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Adaugă secțiune
          </p>
          <div className="flex flex-col gap-1">
            {addableTypes.map((type) => (
              <button
                key={type}
                onClick={() => addSection(type)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-400 hover:border-indigo-400 hover:text-indigo-600 dark:hover:border-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
              >
                <span aria-hidden="true">{SECTION_ICONS[type]}</span>
                {SECTION_LABELS[type]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
