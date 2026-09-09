import { apiClient } from './client'

export type ThemeStatus = 'draft' | 'published' | 'archived'
export type ThemeCreatedBy = 'merchant' | 'ai_wizard' | 'system'

export interface ThemeVersion {
  id: string
  storeId: string
  schemaVersion: number
  config: ThemeConfig
  status: ThemeStatus
  createdBy: ThemeCreatedBy
  label: string | null
  hasA11yWarning: boolean
  createdAt: string
}

export interface ThemeSummary {
  draft: ThemeVersion | null
  published: ThemeVersion | null
  versions: ThemeVersion[]
}

export interface ContrastPair {
  label: string
  foreground: string
  background: string
  ratio: number
  passAA: boolean
}

export interface ContrastCheckResult {
  pairs: ContrastPair[]
  allPass: boolean
}

export interface PublishResult {
  version: ThemeVersion
  contrast: ContrastCheckResult
}

// ─── ThemeConfig mirror (subset — full schema lives in API domain) ─────────────

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

export interface HeroSection {
  id: string
  type: 'hero'
  visible: boolean
  props: {
    image: string | null
    headline: string
    subtitle: string | null
    ctaLabel: string
    ctaTarget: 'shop' | 'collection'
    collectionId: string | null
    overlayOpacity: number
  }
}

export interface FeaturedProductsSection {
  id: string
  type: 'featuredProducts'
  visible: boolean
  props: {
    title: string
    source: 'new_arrivals' | 'collection' | 'manual'
    collectionId: string | null
    limit: number
  }
}

export interface BannerSection {
  id: string
  type: 'banner'
  visible: boolean
  props: { text: string; ctaLabel: string | null; ctaUrl: string | null; backgroundColor: string | null }
}

export interface TestimonialsSection {
  id: string
  type: 'testimonials'
  visible: boolean
  props: { title: string; items: { author: string; text: string; rating: number }[] }
}

export interface CollectionGridSection {
  id: string
  type: 'collectionGrid'
  visible: boolean
  props: { title: string; limit: number }
}

export type ThemeSection =
  | HeroSection
  | FeaturedProductsSection
  | BannerSection
  | TestimonialsSection
  | CollectionGridSection

// ─── API ─────────────────────────────────────────────────────────────────────

export const themeApi = {
  getSummary: (): Promise<ThemeSummary> =>
    apiClient.get('/theme').then((r) => r.data),

  createDraft: (): Promise<ThemeVersion> =>
    apiClient.post('/theme/draft').then((r) => r.data),

  applyPatch: (config: ThemeConfig): Promise<ThemeVersion> =>
    apiClient.patch('/theme/draft', { config }).then((r) => r.data),

  publish: (forcePublish = false): Promise<PublishResult> =>
    apiClient.post('/theme/publish', { forcePublish }).then((r) => r.data),

  rollback: (versionId: string): Promise<ThemeVersion> =>
    apiClient.post(`/theme/rollback/${versionId}`).then((r) => r.data),
}
