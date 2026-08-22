import { randomUUID } from 'crypto'
import type { IStorageProvider } from '../../../../lib/storage'
import type { ICatalogVariantImageRepository, ICatalogVariantRepository } from '../../domain/ports'
import type { CatalogVariantImageEntity } from '../../domain/entities'
import { CatalogVariantImageError } from '../../domain/errors'
import { compressImage } from '../../../../lib/image-compress'

export { CatalogVariantImageError }

const MAX_IMAGES_PER_VARIANT = 10

export class CatalogVariantImageService {
  constructor(
    private readonly imageRepo: ICatalogVariantImageRepository,
    private readonly variantRepo: ICatalogVariantRepository,
    private readonly storage: IStorageProvider,
    private readonly storagePublicUrl: string,
  ) {}

  async uploadImage(
    catalogProductId: string,
    variantId: string,
    file: Express.Multer.File,
  ): Promise<CatalogVariantImageEntity> {
    const variant = await this.variantRepo.findVariant(variantId, catalogProductId)
    if (!variant) throw new CatalogVariantImageError('Variant not found', 'NOT_FOUND')

    const count = await this.imageRepo.countByVariantId(variantId)
    if (count >= MAX_IMAGES_PER_VARIANT) {
      throw new CatalogVariantImageError(`Maximum ${MAX_IMAGES_PER_VARIANT} images per variant`, 'LIMIT_EXCEEDED')
    }

    const { buffer, mimeType, ext } = await compressImage(file.buffer)
    const key = `catalog-variants/${variantId}/${randomUUID()}${ext}`
    const url = await this.storage.upload(key, buffer, mimeType)

    return this.imageRepo.create({
      catalogVariantId: variantId,
      url,
      position: count,
      isPrimary: count === 0,
    })
  }

  async deleteImage(
    catalogProductId: string,
    variantId: string,
    imageId: string,
  ): Promise<void> {
    const variant = await this.variantRepo.findVariant(variantId, catalogProductId)
    if (!variant) throw new CatalogVariantImageError('Variant not found', 'NOT_FOUND')

    const image = await this.imageRepo.findById(imageId)
    if (image?.catalogVariantId !== variantId) {
      throw new CatalogVariantImageError('Image not found', 'NOT_FOUND')
    }

    const key = image.url.replace(`${this.storagePublicUrl}/`, '')
    await this.storage.delete(key)
    await this.imageRepo.delete(imageId)

    if (image.isPrimary) {
      await this.imageRepo.promoteFirstRemaining(variantId)
    }
  }
}
