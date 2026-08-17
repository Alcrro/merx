import type { ThemeVersion, CreateThemeVersionData } from './entities'

export interface IThemeRepository {
  saveDraft(data: CreateThemeVersionData): Promise<ThemeVersion>
  getDraft(storeId: string): Promise<ThemeVersion | null>
  getPublished(storeId: string): Promise<ThemeVersion | null>
  getById(storeId: string, versionId: string): Promise<ThemeVersion | null>
  updateDraftConfig(versionId: string, config: import('./theme.schema').ThemeConfig, hasA11yWarning: boolean): Promise<ThemeVersion>
  publish(storeId: string, versionId: string, hasA11yWarning: boolean): Promise<ThemeVersion>
  rollback(storeId: string, versionId: string): Promise<ThemeVersion>
  listVersions(storeId: string): Promise<ThemeVersion[]>
}
