import { useRef } from 'react'
import type { ThemeTokens, FontPair, ColorTokens } from '@merx/api-client'

const FONT_PAIRS: { value: FontPair; label: string }[] = [
  { value: 'inter', label: 'Inter / Inter' },
  { value: 'playfair-inter', label: 'Playfair Display / Inter' },
  { value: 'montserrat-lato', label: 'Montserrat / Lato' },
  { value: 'raleway-merriweather', label: 'Raleway / Merriweather' },
  { value: 'oswald-opensans', label: 'Oswald / Open Sans' },
  { value: 'poppins-nunito', label: 'Poppins / Nunito' },
  { value: 'cormorant-jost', label: 'Cormorant / Jost' },
  { value: 'dm-sans', label: 'DM Sans / DM Sans' },
]

const COLOR_LABELS: { key: keyof ColorTokens; label: string }[] = [
  { key: 'primary', label: 'Primar' },
  { key: 'accent', label: 'Accent' },
  { key: 'background', label: 'Fundal' },
  { key: 'surface', label: 'Suprafață' },
  { key: 'text', label: 'Text' },
  { key: 'textMuted', label: 'Text secundar' },
]

interface TokenEditorProps {
  tokens: ThemeTokens
  onChange: (tokens: ThemeTokens) => void
}

export function TokenEditor({ tokens, onChange }: TokenEditorProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function setColor(key: keyof ColorTokens, value: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onChange({ ...tokens, color: { ...tokens.color, [key]: value } })
    }, 200)
  }

  function setFontPair(pair: FontPair) {
    onChange({ ...tokens, typography: { ...tokens.typography, heading: pair, body: pair } })
  }

  function setScale(scale: ThemeTokens['typography']['scale']) {
    onChange({ ...tokens, typography: { ...tokens.typography, scale } })
  }

  function setRadius(radius: ThemeTokens['shape']['radius']) {
    onChange({ ...tokens, shape: { ...tokens.shape, radius } })
  }

  function setDensity(density: ThemeTokens['shape']['density']) {
    onChange({ ...tokens, shape: { ...tokens.shape, density } })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Colors */}
      <section>
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Culori</h3>
        <div className="grid grid-cols-2 gap-3">
          {COLOR_LABELS.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer group">
              <div className="relative w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shrink-0">
                <input
                  type="color"
                  defaultValue={tokens.color[key]}
                  onChange={(e) => setColor(key, e.target.value)}
                  className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                />
                <div className="w-full h-full" style={{ backgroundColor: tokens.color[key] }} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">{tokens.color[key]}</span>
              </div>
            </label>
          ))}
        </div>
      </section>

      {/* Font pair */}
      <section>
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Fonturi</h3>
        <div className="flex flex-col gap-1.5">
          {FONT_PAIRS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFontPair(value)}
              className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                tokens.typography.heading === value
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Scale */}
      <section>
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Scală text</h3>
        <div className="flex gap-2">
          {(['compact', 'normal', 'large'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setScale(s)}
              className={`flex-1 py-1.5 rounded-lg text-sm capitalize transition-colors ${
                tokens.typography.scale === s
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      {/* Radius */}
      <section>
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Rotunjire colțuri</h3>
        <div className="flex gap-2 flex-wrap">
          {(['none', 'sm', 'md', 'lg', 'full'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRadius(r)}
              className={`px-3 py-1.5 rounded-lg text-sm uppercase transition-colors ${
                tokens.shape.radius === r
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </section>

      {/* Density */}
      <section>
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Densitate spațiere</h3>
        <div className="flex gap-2">
          {(['compact', 'normal', 'airy'] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDensity(d)}
              className={`flex-1 py-1.5 rounded-lg text-sm capitalize transition-colors ${
                tokens.shape.density === d
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
