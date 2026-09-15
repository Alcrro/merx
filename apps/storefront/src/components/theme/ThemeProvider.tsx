import type { ThemeTokens } from '@/lib/theme'

const FONT_STACKS: Record<string, { heading: string; body: string }> = {
  'inter':                { heading: 'Inter, system-ui, sans-serif',                     body: 'Inter, system-ui, sans-serif' },
  'playfair-inter':       { heading: '"Playfair Display", Georgia, serif',               body: 'Inter, system-ui, sans-serif' },
  'montserrat-lato':      { heading: 'Montserrat, system-ui, sans-serif',                body: 'Lato, system-ui, sans-serif' },
  'raleway-merriweather': { heading: 'Raleway, system-ui, sans-serif',                   body: 'Merriweather, Georgia, serif' },
  'oswald-opensans':      { heading: 'Oswald, system-ui, sans-serif',                    body: '"Open Sans", system-ui, sans-serif' },
  'poppins-nunito':       { heading: 'Poppins, system-ui, sans-serif',                   body: 'Nunito, system-ui, sans-serif' },
  'cormorant-jost':       { heading: '"Cormorant Garamond", Georgia, serif',             body: 'Jost, system-ui, sans-serif' },
  'dm-sans':              { heading: '"DM Sans", system-ui, sans-serif',                 body: '"DM Sans", system-ui, sans-serif' },
}

const RADIUS_MAP: Record<string, string> = {
  none: '0px',
  sm:   '0.25rem',
  md:   '0.375rem',
  lg:   '0.5rem',
  full: '9999px',
}

const SCALE_MAP: Record<string, string> = {
  compact: '0.875',
  normal:  '1',
  large:   '1.125',
}

const DENSITY_MAP: Record<string, string> = {
  compact: '0.75rem',
  normal:  '1rem',
  airy:    '1.5rem',
}

interface ThemeProviderProps {
  tokens: ThemeTokens
}

export function ThemeProvider({ tokens }: ThemeProviderProps) {
  const fonts = FONT_STACKS[tokens.typography.heading] ?? FONT_STACKS['inter']

  const css = `
    :root {
      --color-primary: ${tokens.color.primary};
      --color-accent: ${tokens.color.accent};
      --color-background: ${tokens.color.background};
      --color-surface: ${tokens.color.surface};
      --color-text: ${tokens.color.text};
      --color-text-muted: ${tokens.color.textMuted};
      --font-heading: ${fonts.heading};
      --font-body: ${fonts.body};
      --text-scale: ${SCALE_MAP[tokens.typography.scale] ?? '1'};
      --radius: ${RADIUS_MAP[tokens.shape.radius] ?? '0.375rem'};
      --density: ${DENSITY_MAP[tokens.shape.density] ?? '1rem'};
    }
    body {
      background-color: var(--color-background);
      color: var(--color-text);
      font-family: var(--font-body);
    }
  `.trim()

  return <style dangerouslySetInnerHTML={{ __html: css }} />
}
