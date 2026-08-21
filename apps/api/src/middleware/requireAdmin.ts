import type { Response, NextFunction, RequestHandler } from 'express'
import type { AuthenticatedRequest } from './authenticate'
import { prisma } from '../lib/prisma'

export const requireAdmin: RequestHandler = async (req, res, next) => {
  const authReq = req as AuthenticatedRequest
  const user = await prisma.user.findUnique({
    where: { id: authReq.user.userId },
    select: { role: true },
  })

  if (user?.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' })
    return
  }

  next()
}
