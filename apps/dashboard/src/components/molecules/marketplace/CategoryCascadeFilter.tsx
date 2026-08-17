import { useState, useEffect, useRef } from 'react'
import type { MarketplaceCategory } from '@merx/api-client'

interface Props {
  categories: MarketplaceCategory[]
  value: string
  onChange: (slug: string) => void
}

const Chevron = ({ open }: { open: boolean }) => (
  <svg
    className={['h-3 w-3 transition-transform duration-150 shrink-0 opacity-60', open ? 'rotate-180' : ''].join(' ')}
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
  </svg>
)

const DROPDOWN_CLS = 'absolute top-full left-0 mt-1.5 z-50 min-w-[170px] rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg py-1 overflow-hidden'
const ITEM_BASE = 'w-full text-left px-3.5 py-2 text-xs transition-colors'
const ITEM_ACTIVE = 'font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
const ITEM_INACTIVE = 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800'
const BTN_ACTIVE = 'border-indigo-400 dark:border-indigo-600 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30'
const BTN_INACTIVE = 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800'

export function CategoryCascadeFilter({ categories, value, onChange }: Props) {
  const [rootOpen, setRootOpen] = useState(false)
  const [subOpen, setSubOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const subRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setRootOpen(false)
      if (subRef.current && !subRef.current.contains(e.target as Node)) setSubOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close sub dropdown when root changes
  useEffect(() => { setSubOpen(false) }, [value])

  const roots = categories.filter((c) => c.parentId === null)
  const activeRoot = value
    ? (roots.find((r) => r.slug === value) ??
       roots.find((r) => r.id === categories.find((c) => c.slug === value)?.parentId))
    : undefined
  const subcats = activeRoot ? categories.filter((c) => c.parentId === activeRoot.id) : []
  const activeSub = subcats.find((c) => c.slug === value)

  if (roots.length === 0) return null

  return (
    <>
      {/* Root dropdown */}
      <div ref={rootRef} className="relative">
        <button
          onClick={() => { setRootOpen((o) => !o); setSubOpen(false) }}
          className={['h-9 px-3 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 border', activeRoot ? BTN_ACTIVE : BTN_INACTIVE].join(' ')}
        >
          {activeRoot ? activeRoot.name : 'Categorie'}
          <Chevron open={rootOpen} />
        </button>

        {rootOpen && (
          <div className={DROPDOWN_CLS}>
            <button
              onClick={() => { onChange(''); setRootOpen(false) }}
              className={[ITEM_BASE, 'font-medium', !value ? ITEM_ACTIVE : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800'].join(' ')}
            >
              Toate categoriile
            </button>
            <div className="my-1 border-t border-gray-100 dark:border-gray-800" />
            {roots.map((root) => (
              <button
                key={root.id}
                onClick={() => { onChange(root.slug); setRootOpen(false) }}
                className={[ITEM_BASE, activeRoot?.id === root.id ? ITEM_ACTIVE : ITEM_INACTIVE].join(' ')}
              >
                {root.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Subcategory dropdown — appears only when active root has children */}
      {subcats.length > 0 && (
        <div ref={subRef} className="relative">
          <button
            onClick={() => { setSubOpen((o) => !o); setRootOpen(false) }}
            className={['h-9 px-3 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 border', activeSub ? BTN_ACTIVE : BTN_INACTIVE].join(' ')}
          >
            {activeSub ? activeSub.name : 'Subcategorie'}
            <Chevron open={subOpen} />
          </button>

          {subOpen && (
            <div className={DROPDOWN_CLS}>
              <button
                onClick={() => { onChange(activeRoot!.slug); setSubOpen(false) }}
                className={[ITEM_BASE, 'font-medium', !activeSub ? ITEM_ACTIVE : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800'].join(' ')}
              >
                Toate din {activeRoot!.name}
              </button>
              <div className="my-1 border-t border-gray-100 dark:border-gray-800" />
              {subcats.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => { onChange(sub.slug); setSubOpen(false) }}
                  className={[ITEM_BASE, activeSub?.id === sub.id ? ITEM_ACTIVE : ITEM_INACTIVE].join(' ')}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
