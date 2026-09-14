import { useRef, useState, useEffect } from 'react'
import { DropdownBase } from '../primitives/DropdownBase'
import { IconButton, XIcon } from '../primitives/IconButton'

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

function CountryList({
  items,
  value,
  onSelect,
}: {
  items: typeof COUNTRIES
  value: string
  onSelect: (code: string) => void
}) {
  return (
    <ul className="max-h-52 overflow-y-auto py-1">
      {items.length === 0 ? (
        <li className="px-3 py-4 text-sm text-fg-muted text-center">Nicio țară găsită</li>
      ) : (
        items.map((c) => (
          <li key={c.code}>
            <button
              type="button"
              onClick={() => onSelect(c.code)}
              className={[
                'w-full flex items-center justify-between gap-2 px-3 py-2 text-sm transition-colors',
                c.code === value
                  ? 'bg-brand-subtle text-brand-text font-medium'
                  : 'text-fg-secondary hover:bg-surface-hover',
              ].join(' ')}
            >
              <span>{c.name}</span>
              <span className="text-xs font-mono text-fg-muted">{c.code}</span>
            </button>
          </li>
        ))
      )}
    </ul>
  )
}

function CountrySelectCompact({ value, onChange, placeholder }: Omit<CountrySelectProps, 'compact'>) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = COUNTRIES.find((c) => c.code === value)
  const filtered = query
    ? COUNTRIES.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()) || c.code.toLowerCase().includes(query.toLowerCase()))
    : COUNTRIES

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setQuery('') }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function select(code: string) { onChange(code); setOpen(false); setQuery('') }
  function clear(e: React.MouseEvent) { e.stopPropagation(); onChange(''); setQuery(''); setOpen(false) }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => { setOpen((o) => !o); setQuery('') }}
        className="flex items-center gap-1 text-sm text-fg-primary outline-none"
      >
        {selected
          ? <span className="font-medium uppercase tracking-widest">{selected.code}</span>
          : <span className="text-fg-muted">{placeholder}</span>
        }
      </button>
      {open && (
        <div className="dropdown-panel left-0 top-full mt-2 w-52">
          {value && (
            <button type="button" onClick={clear} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-fg-muted hover:bg-surface-hover transition-colors">
              <span className="text-xs">✕</span> Toate țările
            </button>
          )}
          <div className="dropdown-search">
            <input autoFocus type="text" placeholder="Caută țară..." value={query} onChange={(e) => setQuery(e.target.value)} className="w-full bg-transparent text-sm text-fg-primary placeholder:text-fg-muted outline-none" />
          </div>
          <CountryList items={filtered} value={value} onSelect={select} />
        </div>
      )}
    </div>
  )
}

export function CountrySelect({ value, onChange, placeholder = 'Țară', compact = false }: CountrySelectProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const selected = COUNTRIES.find((c) => c.code === value)
  const filtered = query
    ? COUNTRIES.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()) || c.code.toLowerCase().includes(query.toLowerCase()))
    : COUNTRIES

  if (compact) return <CountrySelectCompact value={value} onChange={onChange} placeholder={placeholder} />

  function handleOpenChange(next: boolean) { setOpen(next); if (!next) setQuery('') }
  function select(code: string) { onChange(code); setOpen(false); setQuery('') }
  function clear(e: React.MouseEvent) { e.stopPropagation(); onChange(''); setQuery(''); setOpen(false) }

  return (
    <DropdownBase
      open={open}
      onOpenChange={handleOpenChange}
      trigger={
        <>
          <span className={['truncate', selected ? 'text-fg-primary' : 'text-fg-muted'].join(' ')}>
            {selected ? `${selected.name} (${selected.code})` : placeholder}
          </span>
          {value && (
            <IconButton label="Șterge" onClick={clear} className="ml-auto shrink-0">
              <XIcon />
            </IconButton>
          )}
        </>
      }
    >
      <div className="dropdown-search">
        <input autoFocus type="text" placeholder="Caută țară..." value={query} onChange={(e) => setQuery(e.target.value)} className="w-full bg-transparent text-sm text-fg-primary placeholder:text-fg-muted outline-none" />
      </div>
      <CountryList items={filtered} value={value} onSelect={select} />
    </DropdownBase>
  )
}
