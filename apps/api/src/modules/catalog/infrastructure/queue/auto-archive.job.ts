import { Queue, Worker } from 'bullmq'
import { createRedisConnection } from '../../../../lib/redis'
import { EvaluateAndArchiveProductsUseCase } from '../../application/use-cases/evaluate-and-archive-products.use-case'
import { archiveCriteriaRepository } from '../db/archive-criteria.repository'

const QUEUE_NAME = 'auto-archive-catalog'

let evaluateAndArchive: EvaluateAndArchiveProductsUseCase | null = null

function getUseCase(): EvaluateAndArchiveProductsUseCase {
  if (!evaluateAndArchive) {
    evaluateAndArchive = new EvaluateAndArchiveProductsUseCase(archiveCriteriaRepository)
  }
  return evaluateAndArchive
}

export function startAutoArchiveWorker(): void {
  const queue = new Queue(QUEUE_NAME, { connection: createRedisConnection() })

  const worker = new Worker(
    QUEUE_NAME,
    async () => {
      const result = await getUseCase().execute()
      if (result.archived > 0) {
        console.log(`[auto-archive] archived ${result.archived} catalog product(s)`)
      }
      return result
    },
    { connection: createRedisConnection() }
  )

  worker.on('failed', (job, err) => {
    console.error(`[auto-archive-worker] job ${job?.id ?? 'unknown'} failed:`, err)
  })

  void queue.upsertJobScheduler(
    'daily-auto-archive',
    { pattern: '0 2 * * *', tz: 'UTC' },
    { name: 'auto-archive', data: {} }
  )
}
