import type { CatalogProductStatus } from '../types'

export interface IModerationRepository {
  findProduct(catalogProductId: string): Promise<{ title: string; description: string | null } | null>
  updateStatus(catalogProductId: string, status: CatalogProductStatus): Promise<void>
}
