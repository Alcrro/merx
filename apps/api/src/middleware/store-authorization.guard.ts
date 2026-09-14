import type { Response, NextFunction, RequestHandler } from 'express'
import type { AuthenticatedRequest, AuthenticatedStoreRequest } from './authenticate'
import { prisma } from '../lib/prisma'

export type { AuthenticatedStoreRequest }

export const storeAuthorizationGuard: RequestHandler = async (req, res, next) => {
  const authReq = req as AuthenticatedRequest

  if (authReq.user.type !== 'store') {
    res.status(403).json({ error: 'PLATFORM_TOKEN_NOT_ACCEPTED' })
    return
  }

  const store = await prisma.store.findUnique({
    where: { id: authReq.user.storeId },
    select: { id: true, name: true, slug: true, status: true, ownerId: true },
  })

  if (!store) {
    res.status(403).json({ error: 'STORE_NOT_FOUND' })
    return
  }

  if (store.status === 'blocked') {
    res.status(403).json({ error: 'STORE_BLOCKED' })
    return
  }

  ;(req as AuthenticatedStoreRequest).store = store
  next()
}
