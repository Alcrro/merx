export interface ColorTokens {
  primary: string
  accent: string
  background: string
  surface: string
  text: string
  textMuted: string
}

export type FontPair =
  | 'inter'
  | 'playfair-inter'
  | 'montserrat-lato'
  | 'raleway-merriweather'
  | 'oswald-opensans'
  | 'poppins-nunito'
  | 'cormorant-jost'
  | 'dm-sans'

export interface ThemeTokens {
  color: ColorTokens
  typography: { heading: FontPair; body: FontPair; scale: 'compact' | 'normal' | 'large' }
  shape: { radius: 'none' | 'sm' | 'md' | 'lg' | 'full'; density: 'compact' | 'normal' | 'airy' }
}

export interface HeroSectionProps {
  image: string | null
  headline: string
  subtitle: string | null
  ctaLabel: string
  ctaTarget: 'shop' | 'collection'
  collectionId: string | null
  overlayOpacity: number
}

export interface FeaturedProductsSectionProps {
  title: string
  source: 'new_arrivals' | 'collection' | 'manual'
  collectionId: string | null
  limit: number
}

export interface PuckComponentData {
  type: string
  props: Record<string, unknown> & { id: string }
}

export interface PuckData {
  content: PuckComponentData[]
  root: { props: Record<string, unknown> }
  zones?: Record<string, PuckComponentData[]>
}

export interface ThemeConfig {
  schemaVersion: 1
  base: string
  tokens: ThemeTokens
  brand: { logo: string | null; favicon: string | null }
  seo: { titleTemplate: string; defaultDescription: string; ogImage: 'auto' | 'none' }
  pages: {
    home: {
      puckData: PuckData
    }
  }
}

const DEFAULT_TOKENS: ThemeTokens = {
  color: {
    primary: '#4f46e5',
    accent: '#06b6d4',
    background: '#ffffff',
    surface: '#f9fafb',
    text: '#111827',
    textMuted: '#6b7280',
  },
  typography: { heading: 'inter', body: 'inter', scale: 'normal' },
  shape: { radius: 'md', density: 'normal' },
}

const DEFAULT_CONFIG: ThemeConfig = {
  schemaVersion: 1,
  base: 'default',
  tokens: DEFAULT_TOKENS,
  brand: { logo: null, favicon: null },
  seo: { titleTemplate: '%s', defaultDescription: '', ogImage: 'none' },
  pages: { home: { puckData: { content: [], root: { props: {} } } } },
}

const baseUrl = process.env.API_URL ?? 'http://localhost:3001'

import { cache } from 'react'

export const getPublishedTheme = cache(async (slug: string): Promise<ThemeConfig> => {
  try {
    const res = await fetch(`${baseUrl}/api/v1/storefront/${slug}/theme`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) return DEFAULT_CONFIG
    const body = (await res.json()) as { config: ThemeConfig }
    return body.config ?? DEFAULT_CONFIG
  } catch {
    return DEFAULT_CONFIG
  }
})

export async function getPreviewTheme(slug: string, previewId: string): Promise<ThemeConfig> {
  try {
    const res = await fetch(
      `${baseUrl}/api/v1/storefront/${slug}/theme?previewId=${encodeURIComponent(previewId)}`,
      { cache: 'no-store' },
    )
    if (!res.ok) return DEFAULT_CONFIG
    const body = (await res.json()) as { config: ThemeConfig }
    return body.config ?? DEFAULT_CONFIG
  } catch {
    return DEFAULT_CONFIG
  }
}

export async function getTheme(slug: string, previewId: string | null): Promise<ThemeConfig> {
  if (previewId) return getPreviewTheme(slug, previewId)
  return getPublishedTheme(slug)
}
