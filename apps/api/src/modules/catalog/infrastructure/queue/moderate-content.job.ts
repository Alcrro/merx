import { Queue, Worker } from 'bullmq'
import { createRedisConnection } from '../../../../lib/redis'
import { ContentModerationService } from '../../application/services/content-moderation.service'
import { OpenAIProvider } from '@merx/llm-provider'
import { aiToolCriteriaRepository } from '../db/ai-tool-criteria.repository'
import { moderationRepository } from '../db/moderation.repository'

const QUEUE_NAME = 'moderate-content'

let moderateQueue: Queue | null = null
let moderationService: ContentModerationService | null = null

function getModerationService(): ContentModerationService {
  if (!moderationService) {
    moderationService = new ContentModerationService(
      new OpenAIProvider(),
      aiToolCriteriaRepository,
      moderationRepository,
    )
  }
  return moderationService
}

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
      await getModerationService().moderateProduct(catalogProductId)
      return { catalogProductId }
    },
    { connection: createRedisConnection() }
  )

  worker.on('failed', (job, err) => {
    console.error(`[moderate-content-worker] job ${job?.id ?? 'unknown'} failed:`, err)
  })
}
