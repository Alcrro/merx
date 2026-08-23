import { Queue, Worker } from 'bullmq'
import { createRedisConnection } from '../../../lib/redis'
import { discountService } from '../application/discount.service'

const QUEUE_NAME = 'release-orphan-reservations'
// Reservations with no stripeSessionId older than this are considered orphaned
const ORPHAN_THRESHOLD_HOURS = 2

export function startReleaseOrphansWorker(): void {
  const queue = new Queue(QUEUE_NAME, {
    connection: createRedisConnection(),
  })

  const worker = new Worker(
    QUEUE_NAME,
    async () => {
      const olderThan = new Date(Date.now() - ORPHAN_THRESHOLD_HOURS * 60 * 60 * 1000)
      const released = await discountService.releaseOrphans(olderThan)
      if (released > 0) {
        console.log(`[release-orphans] released ${released} orphaned reservation(s)`)
      }
      return { released }
    },
    { connection: createRedisConnection() },
  )

  worker.on('failed', (job, err) => {
    console.error(`[release-orphans-worker] job ${job?.id ?? 'unknown'} failed:`, err)
  })

  // Every 15 minutes
  void queue.upsertJobScheduler(
    'release-orphan-reservations',
    { pattern: '*/15 * * * *', tz: 'UTC' },
    { name: 'release-orphan-reservations', data: {} },
  )
}
