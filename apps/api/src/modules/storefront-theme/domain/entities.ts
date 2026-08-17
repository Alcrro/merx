import type { ThemeConfig } from './theme.schema'

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
  createdAt: Date
}

export interface CreateThemeVersionData {
  storeId: string
  config: ThemeConfig
  createdBy: ThemeCreatedBy
  label?: string
}

export interface ThemeSummary {
  draft: ThemeVersion | null
  published: ThemeVersion | null
  versions: ThemeVersion[]
}

export class ThemeError extends Error {
  constructor(
    message: string,
    public readonly code:
      | 'NOT_FOUND'
      | 'NO_DRAFT'
      | 'NO_PUBLISHED'
      | 'CONTRAST_FAIL'
      | 'INVALID_CONFIG'
      | 'VERSION_NOT_FOUND',
  ) {
    super(message)
    this.name = 'ThemeError'
  }
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
