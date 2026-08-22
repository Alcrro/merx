import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CatalogVariantImageService, CatalogVariantImageError } from '../../application/services/catalog-variant-image.service'
import type { ICatalogVariantImageRepository, ICatalogVariantRepository } from '../../domain/ports'
import type { IStorageProvider } from '../../../../lib/storage'
import { makeImage } from '../fixtures/catalog.fixtures'

vi.mock('../../../../lib/image-compress', () => ({
  compressImage: vi.fn().mockResolvedValue({ buffer: Buffer.from('img'), mimeType: 'image/webp', ext: '.webp' }),
}))

const STORAGE_URL = 'https://cdn.example.com'

describe('CatalogVariantImageService', () => {
  let imageRepo: ICatalogVariantImageRepository
  let variantRepo: ICatalogVariantRepository
  let storage: IStorageProvider
  let service: CatalogVariantImageService

  const fakeFile = { buffer: Buffer.from('data') } as Express.Multer.File

  beforeEach(() => {
    imageRepo = {
      findByVariantId: vi.fn(),
      findById: vi.fn(),
      countByVariantId: vi.fn().mockResolvedValue(0),
      create: vi.fn().mockResolvedValue(makeImage()),
      delete: vi.fn(),
      updatePositions: vi.fn(),
      promoteFirstRemaining: vi.fn(),
    }
    variantRepo = {
      createVariant: vi.fn(),
      findVariant: vi.fn().mockResolvedValue({ id: 'v1' }),
    }
    storage = {
      upload: vi.fn().mockResolvedValue(`${STORAGE_URL}/catalog-variants/v1/uuid.webp`),
      delete: vi.fn(),
    }
    service = new CatalogVariantImageService(imageRepo, variantRepo, storage, STORAGE_URL)
  })

  // ─── uploadImage ─────────────────────────────────────────────────────────────

  describe('uploadImage', () => {
    it('throws NOT_FOUND when variant does not exist', async () => {
      vi.mocked(variantRepo.findVariant).mockResolvedValue(null)
      await expect(service.uploadImage('p1', 'v1', fakeFile))
        .rejects.toMatchObject({ code: 'NOT_FOUND' })
    })

    it('throws LIMIT_EXCEEDED when 10 images already exist', async () => {
      vi.mocked(imageRepo.countByVariantId).mockResolvedValue(10)
      await expect(service.uploadImage('p1', 'v1', fakeFile))
        .rejects.toThrow(CatalogVariantImageError)
      await expect(service.uploadImage('p1', 'v1', fakeFile))
        .rejects.toMatchObject({ code: 'LIMIT_EXCEEDED' })
    })

    it('uploads to storage and creates image record', async () => {
      await service.uploadImage('p1', 'v1', fakeFile)
      expect(storage.upload).toHaveBeenCalled()
      expect(imageRepo.create).toHaveBeenCalled()
    })

    it('sets isPrimary=true for first image (count=0)', async () => {
      vi.mocked(imageRepo.countByVariantId).mockResolvedValue(0)
      await service.uploadImage('p1', 'v1', fakeFile)
      expect(imageRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ isPrimary: true, position: 0 })
      )
    })

    it('sets isPrimary=false for subsequent images', async () => {
      vi.mocked(imageRepo.countByVariantId).mockResolvedValue(3)
      await service.uploadImage('p1', 'v1', fakeFile)
      expect(imageRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ isPrimary: false, position: 3 })
      )
    })

    it('accepts upload when count is exactly 9 (one below limit)', async () => {
      vi.mocked(imageRepo.countByVariantId).mockResolvedValue(9)
      await expect(service.uploadImage('p1', 'v1', fakeFile)).resolves.toBeDefined()
    })
  })

  // ─── deleteImage ─────────────────────────────────────────────────────────────

  describe('deleteImage', () => {
    it('throws NOT_FOUND when variant does not exist', async () => {
      vi.mocked(variantRepo.findVariant).mockResolvedValue(null)
      await expect(service.deleteImage('p1', 'v1', 'img1'))
        .rejects.toMatchObject({ code: 'NOT_FOUND' })
    })

    it('throws NOT_FOUND when image does not exist', async () => {
      vi.mocked(imageRepo.findById).mockResolvedValue(null)
      await expect(service.deleteImage('p1', 'v1', 'img1'))
        .rejects.toMatchObject({ code: 'NOT_FOUND' })
    })

    it('throws NOT_FOUND when image belongs to a different variant', async () => {
      vi.mocked(imageRepo.findById).mockResolvedValue(makeImage({ catalogVariantId: 'other-variant' }))
      await expect(service.deleteImage('p1', 'v1', 'img1'))
        .rejects.toMatchObject({ code: 'NOT_FOUND' })
    })

    it('deletes from storage and repo on happy path', async () => {
      vi.mocked(imageRepo.findById).mockResolvedValue(makeImage({ isPrimary: false }))
      await service.deleteImage('p1', 'v1', 'img1')
      expect(storage.delete).toHaveBeenCalledWith('img.webp')
      expect(imageRepo.delete).toHaveBeenCalledWith('img1')
    })

    it('promotes next image when deleting the primary', async () => {
      vi.mocked(imageRepo.findById).mockResolvedValue(makeImage({ isPrimary: true }))
      await service.deleteImage('p1', 'v1', 'img1')
      expect(imageRepo.promoteFirstRemaining).toHaveBeenCalledWith('v1')
    })

    it('does NOT call promoteFirstRemaining when deleting a non-primary', async () => {
      vi.mocked(imageRepo.findById).mockResolvedValue(makeImage({ isPrimary: false }))
      await service.deleteImage('p1', 'v1', 'img1')
      expect(imageRepo.promoteFirstRemaining).not.toHaveBeenCalled()
    })

    it('extracts storage key by stripping public URL prefix', async () => {
      vi.mocked(imageRepo.findById).mockResolvedValue(
        makeImage({ url: `${STORAGE_URL}/catalog-variants/v1/file.webp`, isPrimary: false })
      )
      await service.deleteImage('p1', 'v1', 'img1')
      expect(storage.delete).toHaveBeenCalledWith('catalog-variants/v1/file.webp')
    })
  })
})
