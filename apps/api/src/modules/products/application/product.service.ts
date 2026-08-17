import type { IProductRepository, CreateProductData, UpdateProductData, CreateVariantData, UpdateVariantData } from '../domain/ports'
import type { ProductEntity, ProductVariantEntity, ProductCategoryEntity, ListProductsParams, PaginatedProducts } from '../domain/entities'

export class ProductError extends Error {
  constructor(
    message: string,
    public readonly code: 'NOT_FOUND' | 'CONFLICT' | 'INVALID' | 'FORBIDDEN'
  ) {
    super(message)
    this.name = 'ProductError'
  }
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export class ProductService {
  constructor(private readonly repo: IProductRepository) {}

  list(params: ListProductsParams): Promise<PaginatedProducts> {
    return this.repo.list(params)
  }

  async get(id: string, storeId: string): Promise<ProductEntity> {
    const product = await this.repo.findById(id, storeId)
    if (!product) throw new ProductError('Product not found', 'NOT_FOUND')
    return product
  }

  async create(storeId: string, data: CreateProductData): Promise<ProductEntity> {
    return this.repo.create(storeId, data)
  }

  async update(id: string, storeId: string, data: UpdateProductData): Promise<ProductEntity> {
    const product = await this.repo.findById(id, storeId)
    if (!product) throw new ProductError('Product not found', 'NOT_FOUND')

    if (data.status === 'active' && product.status !== 'active') {
      const variantCount = await this.repo.countVariants(id)
      if (variantCount === 0) {
        throw new ProductError('Cannot activate a product with no variants', 'INVALID')
      }
    }

    return this.repo.update(id, storeId, data)
  }

  async delete(id: string, storeId: string): Promise<void> {
    const product = await this.repo.findById(id, storeId)
    if (!product) throw new ProductError('Product not found', 'NOT_FOUND')

    const hasOrders = await this.repo.hasActiveOrders(id)
    if (hasOrders) {
      throw new ProductError(
        'Product has associated orders. Archive it instead.',
        'CONFLICT'
      )
    }

    await this.repo.delete(id, storeId)
  }

  async createVariant(productId: string, storeId: string, data: CreateVariantData): Promise<ProductVariantEntity> {
    const product = await this.repo.findById(productId, storeId)
    if (!product) throw new ProductError('Product not found', 'NOT_FOUND')
    if (data.price < 0) throw new ProductError('Price cannot be negative', 'INVALID')
    return this.repo.createVariant(productId, storeId, data)
  }

  async updateVariant(variantId: string, productId: string, storeId: string, data: UpdateVariantData): Promise<ProductVariantEntity> {
    const product = await this.repo.findById(productId, storeId)
    if (!product) throw new ProductError('Product not found', 'NOT_FOUND')
    if (data.price !== undefined && data.price < 0) throw new ProductError('Price cannot be negative', 'INVALID')
    return this.repo.updateVariant(variantId, productId, storeId, data)
  }

  async deleteVariant(variantId: string, productId: string, storeId: string): Promise<void> {
    const product = await this.repo.findById(productId, storeId)
    if (!product) throw new ProductError('Product not found', 'NOT_FOUND')
    await this.repo.deleteVariant(variantId, productId, storeId)
  }

  listCategories(storeId: string): Promise<ProductCategoryEntity[]> {
    return this.repo.listCategories(storeId)
  }

  async createCategory(storeId: string, name: string, parentId?: string | null): Promise<ProductCategoryEntity> {
    const slug = slugify(name)
    return this.repo.createCategory(storeId, { name, slug, parentId })
  }
}
