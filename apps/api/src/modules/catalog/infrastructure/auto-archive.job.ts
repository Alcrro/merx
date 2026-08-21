import { Queue, Worker } from 'bullmq'
import { createRedisConnection } from '../../../lib/redis'
import { evaluateAndArchive } from '../application/archive-criteria.service'

const QUEUE_NAME = 'auto-archive-catalog'

export function startAutoArchiveWorker(): void {
  const queue = new Queue(QUEUE_NAME, { connection: createRedisConnection() })

  const worker = new Worker(
    QUEUE_NAME,
    async () => {
      const result = await evaluateAndArchive()
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

  // Run daily at 02:00 UTC
  void queue.upsertJobScheduler(
    'daily-auto-archive',
    { pattern: '0 2 * * *', tz: 'UTC' },
    { name: 'auto-archive', data: {} }
  )
}
