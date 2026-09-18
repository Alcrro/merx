import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT:       'var(--brand)',
          hover:         'var(--brand-hover)',
          active:        'var(--brand-active)',
          subtle:        'var(--brand-subtle)',
          'subtle-hover':'var(--brand-subtle-hover)',
          text:          'var(--brand-text)',
          focus:         'var(--brand-focus)',
          border:        'var(--brand-border)',
        },
        surface: {
          DEFAULT:       'var(--surface)',
          elevated:      'var(--surface-elevated)',
          page:          'var(--surface-page)',
          hover:         'var(--surface-hover)',
        },
        border: {
          DEFAULT:       'var(--border)',
          strong:        'var(--border-strong)',
          subtle:        'var(--border-subtle)',
        },
        fg: {
          primary:       'var(--fg-primary)',
          secondary:     'var(--fg-secondary)',
          muted:         'var(--fg-muted)',
        },
        danger: {
          DEFAULT:       'var(--danger)',
          hover:         'var(--danger-hover)',
          subtle:        'var(--danger-subtle)',
          text:          'var(--danger-text)',
        },
        accent: {
          DEFAULT:       'var(--accent)',
          subtle:        'var(--accent-subtle)',
          text:          'var(--accent-text)',
        },
        warning: {
          DEFAULT:       'var(--warning)',
          subtle:        'var(--warning-subtle)',
          text:          'var(--warning-text)',
        },
        success: {
          DEFAULT:       'var(--success)',
          subtle:        'var(--success-subtle)',
          text:          'var(--success-text)',
        },
        skeleton:        'var(--skeleton)',
      },
      borderRadius: {
        card:   '12px',
        dialog: '16px',
      },
      boxShadow: {
        card:     '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        dialog:   '0 20px 60px -10px rgb(0 0 0 / 0.3), 0 4px 16px rgb(0 0 0 / 0.1)',
        dropdown: '0 4px 16px rgb(0 0 0 / 0.08)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
} satisfies Config
