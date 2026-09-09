import { useState, useCallback, useRef, useEffect } from 'react'
import { Puck } from '@measured/puck'
import type { Data } from '@measured/puck'
import '@measured/puck/dist/index.css'
import type { ThemeConfig, ThemeTokens, ContrastCheckResult } from '@merx/api-client'
import { useStore } from '../../hooks/useStore'
import {
  useThemeSummary,
  useCreateDraft,
  useApplyPatch,
  usePublishTheme,
  useRollback,
} from '../../hooks/useThemeBuilder'
import { TokenEditor } from '../../components/organisms/theme/TokenEditor'
import { Button } from '../../components/atoms/Button'
import { puckConfig } from '../../lib/puck-config'

// Mirrors storefront ThemeProvider — scoped to Puck canvas only
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
  none: '0px', sm: '0.25rem', md: '0.375rem', lg: '0.5rem', full: '9999px',
}

const SCALE_MAP: Record<string, string> = {
  compact: '0.875', normal: '1', large: '1.125',
}

const DENSITY_MAP: Record<string, string> = {
  compact: '0.75rem', normal: '1rem', airy: '1.5rem',
}

function tokensToCSSVars(tokens: ThemeTokens): React.CSSProperties {
  const fonts = FONT_STACKS[tokens.typography.heading] ?? FONT_STACKS['inter']
  return {
    '--color-primary':    tokens.color.primary,
    '--color-accent':     tokens.color.accent,
    '--color-background': tokens.color.background,
    '--color-surface':    tokens.color.surface,
    '--color-text':       tokens.color.text,
    '--color-text-muted': tokens.color.textMuted,
    '--font-heading':     fonts.heading,
    '--font-body':        fonts.body,
    '--radius':           RADIUS_MAP[tokens.shape.radius]   ?? '0.375rem',
    '--text-scale':       SCALE_MAP[tokens.typography.scale] ?? '1',
    '--density':          DENSITY_MAP[tokens.shape.density]  ?? '1rem',
  } as React.CSSProperties
}

type SidebarTab = 'components' | 'tokens'

export function ThemeBuilderPage() {
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('components')
  const [lastContrast, setLastContrast] = useState<ContrastCheckResult | null>(null)
  const [localTokens, setLocalTokens] = useState<ThemeTokens | null>(null)
  const patchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Ține mereu ultima stare Puck — previne trimiterea formatului vechi (sections) la patch token
  const currentPuckDataRef = useRef<Data>({ content: [], root: { props: {} } })

  const { data: store } = useStore()
  const { data: summary, isLoading } = useThemeSummary()
  const createDraft = useCreateDraft()
  const applyPatch = useApplyPatch()
  const publishTheme = usePublishTheme()
  const rollback = useRollback()

  const draft    = summary?.draft     ?? null
  const published = summary?.published ?? null

  // Sync local tokens when draft changes (e.g. after rollback)
  useEffect(() => {
    if (draft) setLocalTokens(draft.config.tokens)
  }, [draft?.id])

  const tokens = localTokens ?? draft?.config.tokens ?? null

  const schedulePatch = useCallback(
    (config: ThemeConfig) => {
      if (patchDebounce.current) clearTimeout(patchDebounce.current)
      patchDebounce.current = setTimeout(() => {
        applyPatch.mutate(config)
      }, 600)
    },
    [applyPatch],
  )

  function buildConfig(base: ThemeConfig, overrides: Partial<ThemeConfig>): ThemeConfig {
    return {
      ...base,
      ...overrides,
      pages: { home: { puckData: currentPuckDataRef.current } } as unknown as ThemeConfig['pages'],
    }
  }

  function handleTokensChange(newTokens: ThemeTokens) {
    if (!draft) return
    setLocalTokens(newTokens)
    schedulePatch(buildConfig(draft.config, { tokens: newTokens }))
  }

  function handlePuckChange(data: Data) {
    if (!draft) return
    currentPuckDataRef.current = data
    schedulePatch(buildConfig(draft.config, {}))
  }

  function handlePublish() {
    publishTheme.mutate(false, {
      onSuccess: (result) => setLastContrast(result.contrast),
      onError: (err: unknown) => {
        const body = (err as { response?: { data?: { code?: string; contrast?: ContrastCheckResult } } })?.response?.data
        if (body?.code === 'CONTRAST_FAIL' && body.contrast) setLastContrast(body.contrast)
      },
    })
  }

  // ─── Loading / empty states ────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-500 dark:text-gray-400">
        Se încarcă tema…
      </div>
    )
  }

  if (!draft && !published) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">Nu există nicio temă configurată.</p>
        <Button onClick={() => createDraft.mutate()} isLoading={createDraft.isPending}>
          Creează temă
        </Button>
      </div>
    )
  }

  if (!draft) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">Nu există draft activ.</p>
        <Button onClick={() => createDraft.mutate()} isLoading={createDraft.isPending}>
          Pornește editarea
        </Button>
      </div>
    )
  }

  // ─── Canvas token CSS vars ─────────────────────────────────────────────────

  const canvasVars = tokens ? tokensToCSSVars(tokens) : {}

  const puckData: Data =
    (draft.config.pages.home as unknown as { puckData?: Data }).puckData ??
    { content: [], root: { props: {} } }

  // Sincronizează ref-ul cu draft-ul curent (important la primul render și rollback)
  currentPuckDataRef.current = puckData

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={{ height: '100%' }}>
      <Puck
        key={draft.id}
        config={puckConfig}
        data={puckData}
        iframe={{ enabled: false }}
        onChange={handlePuckChange}
        onPublish={handlePublish}
        overrides={{
          headerActions: ({ children }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {lastContrast && !lastContrast.allPass && (
                <button
                  onClick={() => publishTheme.mutate(true)}
                  style={{
                    fontSize: 12,
                    padding: '4px 10px',
                    background: '#fef3c7',
                    color: '#92400e',
                    border: '1px solid #fcd34d',
                    borderRadius: 6,
                    cursor: 'pointer',
                  }}
                >
                  ⚠ Contrast slab — publică oricum
                </button>
              )}
              {published && (
                <button
                  onClick={() => rollback.mutate(published.id)}
                  disabled={rollback.isPending}
                  style={{
                    fontSize: 13,
                    padding: '6px 14px',
                    background: 'transparent',
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    cursor: 'pointer',
                    color: '#374151',
                  }}
                >
                  {rollback.isPending ? 'Se revine…' : 'Rollback'}
                </button>
              )}
              {children}
            </div>
          ),

          drawer: ({ children }) => (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Tabs */}
              <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', flexShrink: 0 }}>
                {(['components', 'tokens'] as SidebarTab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSidebarTab(tab)}
                    style={{
                      flex: 1,
                      padding: '10px 0',
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: 'pointer',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: sidebarTab === tab ? '2px solid #4f46e5' : '2px solid transparent',
                      color: sidebarTab === tab ? '#4f46e5' : '#6b7280',
                      transition: 'color 0.15s',
                    }}
                  >
                    {tab === 'components' ? 'Componente' : 'Tokeni'}
                  </button>
                ))}
              </div>

              {/* TokenEditor — montat mereu, vizibil doar pe tab Tokeni */}
              <div style={{
                display: sidebarTab === 'tokens' ? 'block' : 'none',
                flex: 1,
                overflowY: 'auto',
                padding: 16,
              }}>
                {tokens && (
                  <TokenEditor tokens={tokens} onChange={handleTokensChange} />
                )}
              </div>

              {/* Component palette — montat mereu, vizibil doar pe tab Componente */}
              <div style={{
                display: sidebarTab === 'components' ? 'flex' : 'none',
                flex: 1,
                flexDirection: 'column',
                overflow: 'hidden',
              }}>
                {children}
              </div>
            </div>
          ),

          preview: ({ children }) => (
            <div style={{ ...canvasVars, minHeight: '100%' }}>
              {children}
            </div>
          ),
        }}
      />
    </div>
  )
}
