import { createRedisConnection } from './redis'
import { prisma } from './prisma'

export interface TenantInfo {
  storeId: string
  slug: string
  canonicalHost: string | null
}

const TTL_SECONDS = 300 // 5 min — aliniат cu Prisma cache TTL
const KEY_PREFIX = 'tenant:host:'

function cacheKey(host: string): string {
  return `${KEY_PREFIX}${host.toLowerCase()}`
}

let _redis: ReturnType<typeof createRedisConnection> | null = null
function getRedis() {
  if (!_redis) _redis = createRedisConnection()
  return _redis
}

async function lookupByHost(host: string): Promise<TenantInfo | null> {
  // Slug lookup: strip merx.com suffix if present
  const slugMatch = host.match(/^([a-z0-9-]+)\.merx\.com$/i)

  const store = slugMatch
    ? await prisma.store.findFirst({
        where: { slug: slugMatch[1], deletedAt: null },
        select: { id: true, slug: true, canonicalHost: true },
      })
    : await prisma.store.findFirst({
        where: { customDomain: host, deletedAt: null },
        select: { id: true, slug: true, canonicalHost: true },
      })

  if (!store) return null

  return {
    storeId: store.id,
    slug: store.slug,
    canonicalHost: store.canonicalHost,
  }
}

export const tenantCache = {
  async get(host: string): Promise<TenantInfo | null> {
    try {
      const raw = await getRedis().get(cacheKey(host))
      if (raw) return JSON.parse(raw) as TenantInfo
    } catch {
      // Redis unavailable — fall through to DB
    }

    const info = await lookupByHost(host)
    if (!info) return null

    try {
      await getRedis().setex(cacheKey(host), TTL_SECONDS, JSON.stringify(info))
    } catch {
      // Redis unavailable — continue without caching
    }
    return info
  },

  async invalidateByStoreId(storeId: string): Promise<void> {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { slug: true, customDomain: true },
    })
    if (!store) return

    const keys = [`${KEY_PREFIX}${store.slug}.merx.com`]
    if (store.customDomain) keys.push(`${KEY_PREFIX}${store.customDomain}`)

    try {
      if (keys.length) await getRedis().del(...keys)
    } catch {
      // Redis unavailable — ignore
    }
  },

  async invalidateBySlug(slug: string): Promise<void> {
    try {
      await getRedis().del(`${KEY_PREFIX}${slug}.merx.com`)
    } catch {
      // Redis unavailable — ignore
    }
  },
}
