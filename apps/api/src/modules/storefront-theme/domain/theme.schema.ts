import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

// ─── Tokens ──────────────────────────────────────────────────────────────────

const hexColor = z.string().regex(/^#([0-9A-Fa-f]{6})$/, 'Must be a 6-digit hex color')

const ColorTokensSchema = z.object({
  primary: hexColor,
  accent: hexColor,
  background: hexColor,
  surface: hexColor,
  text: hexColor,
  textMuted: hexColor,
})

const FONT_PAIRS = [
  'inter',
  'playfair-inter',
  'montserrat-lato',
  'raleway-merriweather',
  'oswald-opensans',
  'poppins-nunito',
  'cormorant-jost',
  'dm-sans',
] as const

const TypographyTokensSchema = z.object({
  heading: z.enum(FONT_PAIRS),
  body: z.enum(FONT_PAIRS),
  scale: z.enum(['compact', 'normal', 'large']),
})

const ShapeTokensSchema = z.object({
  radius: z.enum(['none', 'sm', 'md', 'lg', 'full']),
  density: z.enum(['compact', 'normal', 'airy']),
})

const TokensSchema = z.object({
  color: ColorTokensSchema,
  typography: TypographyTokensSchema,
  shape: ShapeTokensSchema,
})

// ─── Brand ───────────────────────────────────────────────────────────────────

const BrandSchema = z.object({
  logo: z.string().nullable(),
  favicon: z.string().nullable(),
})

// ─── SEO ─────────────────────────────────────────────────────────────────────

const SeoSchema = z.object({
  titleTemplate: z.string().max(80),
  defaultDescription: z.string().max(160),
  ogImage: z.enum(['auto', 'none']),
})

// ─── Puck page data ───────────────────────────────────────────────────────────

const PuckComponentDataSchema = z.object({
  type: z.string(),
  props: z.record(z.unknown()),
})

const PuckDataSchema = z.object({
  content: z.array(PuckComponentDataSchema),
  root: z.object({ props: z.record(z.unknown()) }),
  zones: z.record(z.array(PuckComponentDataSchema)).optional(),
})

// ─── Pages ───────────────────────────────────────────────────────────────────

const HomePageSchema = z.object({
  puckData: PuckDataSchema,
})

const PagesSchema = z.object({
  home: HomePageSchema,
})

// ─── ThemeConfig (root) ───────────────────────────────────────────────────────

export const ThemeConfigSchema = z.object({
  schemaVersion: z.literal(1),
  base: z.string(),
  tokens: TokensSchema,
  brand: BrandSchema,
  seo: SeoSchema,
  pages: PagesSchema,
})

export type ThemeConfig = z.infer<typeof ThemeConfigSchema>

// ─── JSON Schema derivat din Zod — folosit ca tool input schema pentru AI ────

// TS2589: discriminated union cu 5 variante depășește limita de adâncime a inferenței TypeScript.
// Runtime-ul e corect — zodToJsonSchema primește schema Zod validă și produce JSON Schema corect.
// @ts-expect-error TS2589
export const themeConfigJsonSchema = zodToJsonSchema(ThemeConfigSchema, {
  name: 'ThemeConfig',
  errorMessages: true,
})

// ─── Default theme ────────────────────────────────────────────────────────────

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  schemaVersion: 1,
  base: 'minimal@1',
  tokens: {
    color: {
      primary: '#1A1A1A',
      accent: '#E8562A',
      background: '#FFFFFF',
      surface: '#F6F6F6',
      text: '#111111',
      textMuted: '#6B6B6B',
    },
    typography: {
      heading: 'inter',
      body: 'inter',
      scale: 'normal',
    },
    shape: {
      radius: 'md',
      density: 'normal',
    },
  },
  brand: {
    logo: null,
    favicon: null,
  },
  seo: {
    titleTemplate: '%s | Store',
    defaultDescription: '',
    ogImage: 'auto',
  },
  pages: {
    home: {
      puckData: {
        content: [
          {
            type: 'Hero',
            props: {
              id: 'Hero-default',
              headline: 'Welcome to our store',
              subtitle: 'Explore our collection',
              image: '',
              ctaLabel: 'Shop now',
              ctaTarget: 'shop',
              collectionId: '',
              overlayOpacity: 0.3,
            },
          },
          {
            type: 'FeaturedProducts',
            props: {
              id: 'FeaturedProducts-default',
              title: 'New arrivals',
              source: 'new_arrivals',
              collectionId: '',
              limit: 8,
            },
          },
        ],
        root: { props: {} },
      },
    },
  },
}

// ─── Schema migration infra ───────────────────────────────────────────────────

type MigrationFn = (config: Record<string, unknown>) => Record<string, unknown>

const migrations: Record<number, MigrationFn> = {
  // v1→v2 placeholder — add real migration when v2 schema is defined
  // 1: (config) => ({ ...config, schemaVersion: 2, newField: 'default' }),
}

const SECTION_TYPE_MAP: Record<string, string> = {
  hero: 'Hero',
  featuredProducts: 'FeaturedProducts',
  banner: 'Banner',
  testimonials: 'Testimonials',
  collectionGrid: 'CollectionGrid',
}

function migrateSectionsToPuckData(raw: Record<string, unknown>): Record<string, unknown> {
  const home = (raw.pages as Record<string, unknown> | undefined)?.home as Record<string, unknown> | undefined
  if (!home || 'puckData' in home) return raw

  const sections = (home.sections as unknown[]) ?? []
  const content = sections.map((s) => {
    const section = s as { id: string; type: string; props: Record<string, unknown> }
    const puckType = SECTION_TYPE_MAP[section.type] ?? section.type
    return {
      type: puckType,
      props: {
        id: section.id ?? `${puckType}-migrated`,
        ...section.props,
        image: section.props.image ?? '',
        subtitle: section.props.subtitle ?? '',
        collectionId: section.props.collectionId ?? '',
        ctaUrl: section.props.ctaUrl ?? '',
      },
    }
  })

  return {
    ...raw,
    pages: { home: { puckData: { content, root: { props: {} } } } },
  }
}

export function migrateThemeConfig(raw: Record<string, unknown>): ThemeConfig {
  let current = migrateSectionsToPuckData(raw)
  const currentVersion = (current.schemaVersion as number) ?? 1
  const targetVersion = 1

  for (let v = currentVersion; v < targetVersion; v++) {
    const migrate = migrations[v]
    if (migrate) current = migrate(current)
  }

  return ThemeConfigSchema.parse(current)
}
