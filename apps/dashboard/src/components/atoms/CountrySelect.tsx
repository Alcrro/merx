import { useRef, useState, useEffect } from 'react'

export const COUNTRIES: { code: string; name: string; nameEn: string }[] = [
  { code: 'RO', name: 'România',         nameEn: 'Romania' },
  { code: 'DE', name: 'Germania',        nameEn: 'Germany' },
  { code: 'FR', name: 'Franța',          nameEn: 'France' },
  { code: 'IT', name: 'Italia',          nameEn: 'Italy' },
  { code: 'ES', name: 'Spania',          nameEn: 'Spain' },
  { code: 'PL', name: 'Polonia',         nameEn: 'Poland' },
  { code: 'HU', name: 'Ungaria',         nameEn: 'Hungary' },
  { code: 'BG', name: 'Bulgaria',        nameEn: 'Bulgaria' },
  { code: 'CZ', name: 'Cehia',           nameEn: 'Czech Republic' },
  { code: 'SK', name: 'Slovacia',        nameEn: 'Slovakia' },
  { code: 'AT', name: 'Austria',         nameEn: 'Austria' },
  { code: 'CH', name: 'Elveția',         nameEn: 'Switzerland' },
  { code: 'NL', name: 'Olanda',          nameEn: 'Netherlands' },
  { code: 'BE', name: 'Belgia',          nameEn: 'Belgium' },
  { code: 'SE', name: 'Suedia',          nameEn: 'Sweden' },
  { code: 'NO', name: 'Norvegia',        nameEn: 'Norway' },
  { code: 'DK', name: 'Danemarca',       nameEn: 'Denmark' },
  { code: 'FI', name: 'Finlanda',        nameEn: 'Finland' },
  { code: 'PT', name: 'Portugalia',      nameEn: 'Portugal' },
  { code: 'GR', name: 'Grecia',          nameEn: 'Greece' },
  { code: 'HR', name: 'Croația',         nameEn: 'Croatia' },
  { code: 'RS', name: 'Serbia',          nameEn: 'Serbia' },
  { code: 'MD', name: 'Moldova',         nameEn: 'Moldova' },
  { code: 'UA', name: 'Ucraina',         nameEn: 'Ukraine' },
  { code: 'GB', name: 'Marea Britanie',  nameEn: 'United Kingdom' },
  { code: 'IE', name: 'Irlanda',         nameEn: 'Ireland' },
  { code: 'US', name: 'Statele Unite',   nameEn: 'United States' },
  { code: 'CA', name: 'Canada',          nameEn: 'Canada' },
  { code: 'AU', name: 'Australia',       nameEn: 'Australia' },
  { code: 'TR', name: 'Turcia',          nameEn: 'Turkey' },
  { code: 'IL', name: 'Israel',          nameEn: 'Israel' },
  { code: 'AE', name: 'Emiratele Arabe', nameEn: 'United Arab Emirates' },
  { code: 'CN', name: 'China',           nameEn: 'China' },
  { code: 'JP', name: 'Japonia',         nameEn: 'Japan' },
  { code: 'IN', name: 'India',           nameEn: 'India' },
]

interface CountrySelectProps {
  value: string
  onChange: (code: string) => void
  placeholder?: string
  compact?: boolean
}

export function CountrySelect({ value, onChange, placeholder = 'Țară', compact = false }: CountrySelectProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selected = COUNTRIES.find((c) => c.code === value)

  const filtered = query
    ? COUNTRIES.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.code.toLowerCase().includes(query.toLowerCase()),
      )
    : COUNTRIES

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function select(code: string) {
    onChange(code)
    setOpen(false)
    setQuery('')
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation()
    onChange('')
    setQuery('')
    setOpen(false)
  }

  if (compact) {
    return (
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => { setOpen((o) => !o); setQuery('') }}
          className="flex items-center gap-1 text-sm text-gray-900 dark:text-gray-100 outline-none"
        >
          {selected ? (
            <span className="font-medium uppercase tracking-widest">{selected.code}</span>
          ) : (
            <span className="text-gray-400 dark:text-gray-500">{placeholder}</span>
          )}
        </button>

        {open && (
          <div className="absolute left-0 top-full mt-2 w-52 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg z-50 overflow-hidden">
            <div className="p-2 border-b border-gray-100 dark:border-gray-800">
              <input
                autoFocus
                type="text"
                placeholder="Caută țară..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none"
              />
            </div>
            <ul className="max-h-52 overflow-y-auto py-1">
              {value && (
                <li>
                  <button
                    type="button"
                    onClick={clear}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span className="text-xs">✕</span> Toate țările
                  </button>
                </li>
              )}
              {filtered.length === 0 ? (
                <li className="px-3 py-4 text-sm text-gray-400 text-center">Nicio țară găsită</li>
              ) : (
                filtered.map((c) => (
                  <li key={c.code}>
                    <button
                      type="button"
                      onClick={() => select(c.code)}
                      className={[
                        'w-full flex items-center justify-between gap-2 px-3 py-2 text-sm transition-colors',
                        c.code === value
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
                      ].join(' ')}
                    >
                      <span>{c.name}</span>
                      <span className="text-xs font-mono text-gray-400 dark:text-gray-500">{c.code}</span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => { setOpen((o) => !o); setQuery('') }}
        className={[
          'w-full flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm transition-colors outline-none',
          open
            ? 'border-indigo-500 ring-2 ring-indigo-500/20'
            : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600',
          'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
        ].join(' ')}
      >
        <span className={selected ? '' : 'text-gray-400 dark:text-gray-500'}>
          {selected ? `${selected.name} (${selected.code})` : placeholder}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {value && (
            <span
              role="button"
              onClick={clear}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-0.5 rounded transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </span>
          )}
          <svg
            className={['h-4 w-4 text-gray-400 transition-transform', open ? 'rotate-180' : ''].join(' ')}
            fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg z-50 overflow-hidden">
          <div className="p-2 border-b border-gray-100 dark:border-gray-800">
            <input
              autoFocus
              type="text"
              placeholder="Caută țară..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none"
            />
          </div>
          <ul className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-4 text-sm text-gray-400 text-center">Nicio țară găsită</li>
            ) : (
              filtered.map((c) => (
                <li key={c.code}>
                  <button
                    type="button"
                    onClick={() => select(c.code)}
                    className={[
                      'w-full flex items-center justify-between gap-2 px-3 py-2 text-sm transition-colors',
                      c.code === value
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
                    ].join(' ')}
                  >
                    <span>{c.name}</span>
                    <span className="text-xs font-mono text-gray-400 dark:text-gray-500">{c.code}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
