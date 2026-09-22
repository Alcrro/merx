import type { Config } from 'tailwindcss'
import tailwindcssAnimate from 'tailwindcss-animate'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
        fg: {
          DEFAULT: 'var(--color-fg)',
          muted:   'var(--color-fg-muted)',
          subtle:  'var(--color-fg-subtle)',
          inverted: 'var(--color-fg-inverted)',
        },
        surface: {
          DEFAULT:  'var(--color-surface)',
          subtle:   'var(--color-surface-subtle)',
          recessed: 'var(--color-surface-recessed)',
          elevated: 'var(--color-surface-elevated)',
          overlay:  'var(--color-surface-overlay)',
          nav:      'var(--color-surface-nav)',
        },
        line: {
          DEFAULT: 'var(--color-stroke)',
          strong:  'var(--color-stroke-strong)',
        },
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover:   'var(--color-primary-hover)',
          subtle:  'var(--color-primary-subtle)',
          fg:      'var(--color-primary-fg)',
        },
        ring:    'var(--color-ring)',
        error:   'var(--color-error)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
      },
    },
  },
  plugins: [tailwindcssAnimate],
}

export default config
