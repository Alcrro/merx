import type { ICatalogProductRepository, ICatalogVariantRepository, CreateCatalogProductData, UpdateCatalogProductData, CreateCatalogVariantData } from '../../domain/ports'
import type { CatalogProductEntity, CatalogVariantEntity } from '../../domain/entities'
import { CatalogError } from '../../domain/errors'
import { Price } from '../../domain/value-objects/price.value-object'

export { CatalogError }

export class CatalogProductService {
  constructor(
    private readonly productRepo: ICatalogProductRepository,
    private readonly variantRepo: ICatalogVariantRepository,
  ) {}

  async adminCreate(data: CreateCatalogProductData): Promise<CatalogProductEntity> {
    return this.productRepo.create(data)
  }

  async adminUpdate(id: string, data: UpdateCatalogProductData): Promise<CatalogProductEntity> {
    const product = await this.productRepo.findById(id)
    if (!product) throw new CatalogError('Catalog product not found', 'NOT_FOUND')
    product.guardCanUpdate()
    return this.productRepo.update(id, data)
  }

  async adminArchive(id: string): Promise<CatalogProductEntity> {
    const product = await this.productRepo.findById(id)
    if (!product) throw new CatalogError('Catalog product not found', 'NOT_FOUND')
    product.archive()
    return this.productRepo.archive(id)
  }

  async adminAddVariant(catalogProductId: string, data: CreateCatalogVariantData): Promise<CatalogVariantEntity> {
    const product = await this.productRepo.findById(catalogProductId)
    if (!product) throw new CatalogError('Catalog product not found', 'NOT_FOUND')
    product.guardActive()
    Price.of(data.suggestedPrice)
    return this.variantRepo.createVariant(catalogProductId, data)
  }
}
