import { Queue, Worker } from 'bullmq'
import { createRedisConnection } from '../../../lib/redis'
import { analyticsRepository } from './analytics.repository'
import { AnalyticsService } from '../application/analytics.service'

const QUEUE_NAME = 'analytics'

interface RecalculateJobData {
  date?: string
}

export function startAnalyticsWorker(): void {
  const service = new AnalyticsService(analyticsRepository)

  const queue = new Queue<RecalculateJobData>(QUEUE_NAME, {
    connection: createRedisConnection(),
  })

  const worker = new Worker<RecalculateJobData>(
    QUEUE_NAME,
    async (job) => {
      const targetDate = job.data.date ? new Date(job.data.date) : yesterday()
      const storesProcessed = await service.recalculateDay(targetDate)
      return { storesProcessed, date: targetDate.toISOString() }
    },
    { connection: createRedisConnection() }
  )

  worker.on('failed', (job, err) => {
    console.error(`[analytics-worker] job ${job?.id ?? 'unknown'} failed:`, err)
  })

  // Schedule daily at 02:00 UTC
  void queue.upsertJobScheduler(
    'daily-metrics',
    { pattern: '0 2 * * *', tz: 'UTC' },
    { name: 'recalculate', data: {} }
  )
}

function yesterday(): Date {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  d.setUTCHours(0, 0, 0, 0)
  return d
}

export function createAnalyticsQueue(): Queue<RecalculateJobData> {
  return new Queue<RecalculateJobData>(QUEUE_NAME, {
    connection: createRedisConnection(),
  })
}
