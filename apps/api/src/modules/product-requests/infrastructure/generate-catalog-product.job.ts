import { Queue, Worker } from 'bullmq'
import { randomUUID } from 'crypto'
import { createRedisConnection } from '../../../lib/redis'
import { prisma } from '../../../lib/prisma'
import { generateCatalogProduct } from '../application/ai-catalog-generator.service'
import { productRequestRepository } from './product-request.repository'
import { fetchProductImages } from '../../../lib/image-fetch'
import { storageProvider } from '../../../lib/storage'

const QUEUE_NAME = 'generate-catalog-product'

let generateQueue: Queue | null = null

export function getGenerateQueue(): Queue {
  if (!generateQueue) {
    generateQueue = new Queue(QUEUE_NAME, { connection: createRedisConnection() })
  }
  return generateQueue
}

export async function enqueueGenerateJob(requestId: string): Promise<void> {
  await getGenerateQueue().add('generate', { requestId }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 10000 },
  })
}

export function startGenerateCatalogProductWorker(): void {
  const worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      const { requestId } = job.data as { requestId: string }

      const request = await productRequestRepository.findById(requestId)
      if (!request) {
        console.warn(`[generate-catalog-product] request ${requestId} not found`)
        return
      }

      let generated
      try {
        generated = await generateCatalogProduct(
          request.requestedTitle,
          request.category,
          request.description
        )
      } catch (err) {
        // AI failed — revert to pending so escalation job can pick it up
        await productRequestRepository.updateStatus(requestId, 'pending')
        console.error(`[generate-catalog-product] AI failed for request ${requestId}:`, err)
        return
      }

      let catalogProductId: string | null = null
      let firstVariantId: string | null = null

      await prisma.$transaction(async (tx) => {
        let categoryId: string | null = null
        if (request.category) {
          const found = await tx.catalogCategory.findFirst({
            where: { name: { equals: request.category, mode: 'insensitive' } },
            select: { id: true },
          })
          categoryId = found?.id ?? null
        }

        const catalogProduct = await tx.catalogProduct.create({
          data: {
            title: generated.title,
            description: generated.description,
            productType: generated.productType ?? null,
            categoryId,
            status: 'pending',
            aiGenerated: true,
            variants: {
              create: generated.variants.map((v) => ({
                title: v.title,
                sku: v.sku,
                suggestedPrice: v.suggestedPrice,
              })),
            },
          },
          include: { variants: { orderBy: { createdAt: 'asc' }, take: 1 } },
        })

        catalogProductId = catalogProduct.id
        firstVariantId = catalogProduct.variants[0]?.id ?? null

        await tx.productRequest.update({
          where: { id: requestId },
          data: { status: 'admin_review', catalogProductId: catalogProduct.id },
        })
      })

      // Attach images to first variant (outside transaction — non-critical)
      if (firstVariantId) {
        try {
          const images = await fetchProductImages(generated.title, 4)
          for (let i = 0; i < images.length; i++) {
            const { buffer, mimeType, ext } = images[i]
            const key = `catalog-variants/${firstVariantId}/${randomUUID()}${ext}`
            const url = await storageProvider.upload(key, buffer, mimeType)
            await prisma.catalogVariantImage.create({
              data: {
                catalogVariantId: firstVariantId,
                url,
                position: i,
                isPrimary: i === 0,
              },
            })
          }
          console.log(`[generate-catalog-product] attached ${images.length} images to variant ${firstVariantId}`)
        } catch (err) {
          console.warn('[generate-catalog-product] image fetch/upload failed (non-critical):', err)
        }
      }

      return { requestId, status: 'admin_review' }
    },
    { connection: createRedisConnection() }
  )

  worker.on('failed', (job, err) => {
    console.error(`[generate-catalog-product-worker] job ${job?.id ?? 'unknown'} failed:`, err)
  })
}
