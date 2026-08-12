import { Queue, Worker } from 'bullmq'
import { createRedisConnection } from '../../../lib/redis'
import { prisma } from '../../../lib/prisma'
import { analyzeStore } from './trend-analyzer'

const QUEUE_NAME = 'ai-insights'

export function startInsightsWorker(): void {
  const queue = new Queue(QUEUE_NAME, { connection: createRedisConnection() })

  const worker = new Worker(
    QUEUE_NAME,
    async () => {
      const stores = await prisma.store.findMany({ select: { id: true } })
      let processed = 0

      for (const store of stores) {
        try {
          const insights = await analyzeStore(store.id)

          // Mark previous active insights as resolved
          await prisma.aIInsight.updateMany({
            where: { storeId: store.id, status: 'active' },
            data: { status: 'resolved', resolvedAt: new Date() },
          })

          if (insights.length > 0) {
            await prisma.aIInsight.createMany({
              data: insights.map((i) => ({
                storeId: store.id,
                type: i.type,
                severity: i.severity,
                title: i.title,
                description: i.description,
                data: i.data as object,
                status: 'active',
              })),
            })
          }

          processed++
        } catch (err) {
          console.error(`[insights-worker] failed for store ${store.id}:`, err)
        }
      }

      return { processed }
    },
    { connection: createRedisConnection() }
  )

  worker.on('failed', (job, err) => {
    console.error(`[insights-worker] job ${job?.id ?? 'unknown'} failed:`, err)
  })

  // Run every 6 hours
  void queue.upsertJobScheduler(
    'periodic-insights',
    { pattern: '0 */6 * * *', tz: 'UTC' },
    { name: 'analyze-all', data: {} }
  )
}

export async function runInsightsForStore(storeId: string): Promise<number> {
  const insights = await analyzeStore(storeId)

  await prisma.aIInsight.updateMany({
    where: { storeId, status: 'active' },
    data: { status: 'resolved', resolvedAt: new Date() },
  })

  if (insights.length > 0) {
    await prisma.aIInsight.createMany({
      data: insights.map((i) => ({
        storeId,
        type: i.type,
        severity: i.severity,
        title: i.title,
        description: i.description,
        data: i.data as object,
        status: 'active',
      })),
    })
  }

  return insights.length
}
