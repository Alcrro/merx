import { randomUUID } from 'crypto'
import { prisma } from '../../../lib/prisma'
import type { IStorageProvider } from '../../../lib/storage'
import type { IProductImageRepository } from '../domain/ports'
import type { ProductImageEntity } from '../domain/entities'
import { ProductError } from './product.service'
import { compressImage } from '../../../lib/image-compress'

const MAX_IMAGES_PER_PRODUCT = 10

export class ProductImageService {
  constructor(
    private readonly imageRepo: IProductImageRepository,
    private readonly storage: IStorageProvider,
    private readonly storagePublicUrl: string,
  ) {}

  async uploadImage(
    productId: string,
    storeId: string,
    file: Express.Multer.File,
  ): Promise<ProductImageEntity> {
    const product = await prisma.product.findFirst({ where: { id: productId, storeId } })
    if (!product) throw new ProductError('Product not found', 'NOT_FOUND')

    const count = await this.imageRepo.countByProductId(productId)
    if (count >= MAX_IMAGES_PER_PRODUCT) {
      throw new ProductError(`Maximum ${MAX_IMAGES_PER_PRODUCT} images per product`, 'INVALID')
    }

    const { buffer, mimeType, ext } = await compressImage(file.buffer)
    const key = `products/${productId}/${randomUUID()}${ext}`
    const url = await this.storage.upload(key, buffer, mimeType)

    return this.imageRepo.create({
      productId,
      url,
      position: count,
      isPrimary: count === 0,
    })
  }

  async deleteImage(productId: string, imageId: string, storeId: string): Promise<void> {
    const product = await prisma.product.findFirst({ where: { id: productId, storeId } })
    if (!product) throw new ProductError('Product not found', 'NOT_FOUND')

    const image = await this.imageRepo.findById(imageId)
    if (!image || image.productId !== productId) {
      throw new ProductError('Image not found', 'NOT_FOUND')
    }

    const key = image.url.replace(`${this.storagePublicUrl}/`, '')
    await this.storage.delete(key)
    await this.imageRepo.delete(imageId)

    if (image.isPrimary) {
      await this.imageRepo.promoteFirstRemaining(productId)
    }
  }

  async reorderImages(productId: string, storeId: string, ids: string[]): Promise<void> {
    const product = await prisma.product.findFirst({ where: { id: productId, storeId } })
    if (!product) throw new ProductError('Product not found', 'NOT_FOUND')

    const existing = await this.imageRepo.findByProductId(productId)
    const existingIds = new Set(existing.map((img) => img.id))
    const allValid = ids.every((id) => existingIds.has(id))
    if (!allValid) throw new ProductError('One or more image IDs do not belong to this product', 'INVALID')

    await this.imageRepo.updatePositions(ids.map((id, index) => ({ id, position: index })))
  }
}
