import { themeRepository } from '../infrastructure/theme.repository'
import { ThemeError, type ContrastCheckResult, type ThemeSummary } from '../domain/entities'
import { ThemeConfigSchema, DEFAULT_THEME_CONFIG, type ThemeConfig } from '../domain/theme.schema'
import { ZodError } from 'zod'

// Inline WCAG AA contrast check — ContrastService (P2) va extinde asta cu auto-fix
function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const c = [r, g, b].map((v) => {
    const s = v / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hexToRgb(hex1))
  const l2 = relativeLuminance(hexToRgb(hex2))
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

const WCAG_AA = 4.5

function checkContrast(config: ThemeConfig): ContrastCheckResult {
  const { color } = config.tokens
  const pairs = [
    { label: 'text / background', foreground: color.text, background: color.background },
    { label: 'textMuted / background', foreground: color.textMuted, background: color.background },
    { label: 'text / surface', foreground: color.text, background: color.surface },
    { label: 'primary / background', foreground: color.primary, background: color.background },
  ].map(({ label, foreground, background }) => {
    const ratio = Math.round(contrastRatio(foreground, background) * 100) / 100
    return { label, foreground, background, ratio, passAA: ratio >= WCAG_AA }
  })

  return { pairs, allPass: pairs.every((p) => p.passAA) }
}

// ─── ThemeService ─────────────────────────────────────────────────────────────

class ThemeService {
  async getSummary(storeId: string): Promise<ThemeSummary> {
    const [draft, published, versions] = await Promise.all([
      themeRepository.getDraft(storeId),
      themeRepository.getPublished(storeId),
      themeRepository.listVersions(storeId),
    ])
    return { draft, published, versions }
  }

  async createDraft(storeId: string): Promise<import('../domain/entities').ThemeVersion> {
    const published = await themeRepository.getPublished(storeId)

    const config = published ? { ...published.config } : { ...DEFAULT_THEME_CONFIG }

    return themeRepository.saveDraft({
      storeId,
      config,
      createdBy: 'merchant',
    })
  }

  async applyPatch(storeId: string, newConfig: unknown): Promise<import('../domain/entities').ThemeVersion> {
    const parsed = ThemeConfigSchema.safeParse(newConfig)
    if (!parsed.success) {
      throw new ThemeError(formatZodError(parsed.error), 'INVALID_CONFIG')
    }

    let draft = await themeRepository.getDraft(storeId)
    if (!draft) {
      draft = await this.createDraft(storeId)
    }

    const contrastResult = checkContrast(parsed.data)

    return themeRepository.updateDraftConfig(draft.id, parsed.data, !contrastResult.allPass)
  }

  async publish(
    storeId: string,
    opts: { forcePublish?: boolean } = {},
  ): Promise<{ version: import('../domain/entities').ThemeVersion; contrast: ContrastCheckResult }> {
    const draft = await themeRepository.getDraft(storeId)
    if (!draft) throw new ThemeError('No draft found for this store', 'NO_DRAFT')

    const contrast = checkContrast(draft.config)

    if (!contrast.allPass && !opts.forcePublish) {
      throw new ThemeError('Theme has contrast issues. Use forcePublish to override.', 'CONTRAST_FAIL')
    }

    const version = await themeRepository.publish(storeId, draft.id, !contrast.allPass)

    return { version, contrast }
  }

  async rollback(
    storeId: string,
    versionId: string,
  ): Promise<import('../domain/entities').ThemeVersion> {
    const target = await themeRepository.getById(storeId, versionId)
    if (!target) throw new ThemeError('Version not found', 'VERSION_NOT_FOUND')

    return themeRepository.rollback(storeId, versionId)
  }

  checkContrast(config: ThemeConfig): ContrastCheckResult {
    return checkContrast(config)
  }
}

export const themeService = new ThemeService()

function formatZodError(error: ZodError): string {
  return error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')
}
