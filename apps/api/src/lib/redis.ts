import IORedis from 'ioredis'
import { config } from '../config'

export function createRedisConnection(): IORedis {
  return new IORedis(config.redis.url, {
    maxRetriesPerRequest: null,
    tls: config.redis.url.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
  })
}
