import type { CatalogVariantEntity } from '../../domain/entities'
import type { CreateCatalogVariantData } from '../../domain/ports'
import type { VariantClassification, ClassificationConfidence, VariantClassifierService } from '../services/variant-classifier.service'
import type { CatalogProductQuery } from '../queries/catalog-product.query'
import type { CatalogProductService } from '../services/catalog-product.service'

export type AddVariantResult =
  | { outcome: 'rejected'; confidence: 'high'; reason?: string }
  | { outcome: 'added'; variant: CatalogVariantEntity; classification: VariantClassification; confidence: ClassificationConfidence; lowConfidenceWarning: boolean }

export class AddVariantWithClassifyUseCase {
  constructor(
    private readonly catalogProductQuery: CatalogProductQuery,
    private readonly catalogProductService: CatalogProductService,
    private readonly classifierService: VariantClassifierService,
  ) {}

  async execute(catalogProductId: string, data: CreateCatalogVariantData): Promise<AddVariantResult> {
    const product = await this.catalogProductQuery.getById(catalogProductId)
    const classification = await this.classifierService.classify(data.title, product.title)

    if (classification.type === 'new_product' && classification.confidence === 'high') {
      return { outcome: 'rejected', confidence: 'high', reason: classification.reason }
    }

    const variant = await this.catalogProductService.adminAddVariant(catalogProductId, data)

    return {
      outcome: 'added',
      variant,
      classification: classification.type,
      confidence: classification.confidence,
      lowConfidenceWarning: classification.confidence === 'low',
    }
  }
}
