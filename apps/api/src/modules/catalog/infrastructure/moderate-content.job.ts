import { Queue, Worker } from 'bullmq'
import { createRedisConnection } from '../../../lib/redis'
import { moderateCatalogProduct } from '../application/content-moderation.service'

const QUEUE_NAME = 'moderate-content'

let moderateQueue: Queue | null = null

export function getModerateQueue(): Queue {
  if (!moderateQueue) {
    moderateQueue = new Queue(QUEUE_NAME, { connection: createRedisConnection() })
  }
  return moderateQueue
}

export async function enqueueModerationJob(catalogProductId: string): Promise<void> {
  await getModerateQueue().add('moderate', { catalogProductId }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
  })
}

export function startModerateContentWorker(): void {
  const worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      const { catalogProductId } = job.data as { catalogProductId: string }
      await moderateCatalogProduct(catalogProductId)
      return { catalogProductId }
    },
    { connection: createRedisConnection() }
  )

  worker.on('failed', (job, err) => {
    console.error(`[moderate-content-worker] job ${job?.id ?? 'unknown'} failed:`, err)
  })
}
