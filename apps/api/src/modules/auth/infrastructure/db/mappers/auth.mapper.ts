import type { AuthUser, AuthStore, AuthStoreWithMeta, StoreStatus } from '../../../domain/types'

type PrismaUser = {
  id: string
  email: string
  name: string | null
  platformRole: 'admin' | 'user'
  emailVerified: boolean
  createdAt: Date
}

type PrismaStore = {
  id: string
  name: string
  slug: string
  currency: string
}

type PrismaStoreWithMeta = PrismaStore & {
  ownerId: string
  status: StoreStatus
}

export const authInfraMapper = {
  toAuthUser(row: PrismaUser): AuthUser {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      platformRole: row.platformRole,
      emailVerified: row.emailVerified,
      createdAt: row.createdAt,
    }
  },

  toAuthStore(row: PrismaStore): AuthStore {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      currency: row.currency,
    }
  },

  toAuthStoreWithMeta(row: PrismaStoreWithMeta): AuthStoreWithMeta {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      currency: row.currency,
      ownerId: row.ownerId,
      status: row.status,
    }
  },
}
