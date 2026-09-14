import type { Response, NextFunction } from 'express'
import type { AuthenticatedRequest } from '../../../../middleware/authenticate'
import { prisma } from '../../../../lib/prisma'
import { dataExportService } from '../../infrastructure/data-export.service'

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000

export async function requestDataExport(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { userId } = req.user

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { lastDataExportAt: true },
    })

    if (user?.lastDataExportAt) {
      const elapsed = Date.now() - user.lastDataExportAt.getTime()
      if (elapsed < TWENTY_FOUR_HOURS_MS) {
        const retryAfterSeconds = Math.ceil((TWENTY_FOUR_HOURS_MS - elapsed) / 1000)
        res.setHeader('Retry-After', retryAfterSeconds)
        res.status(429).json({ error: 'You can request one export per 24 hours.' })
        return
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { lastDataExportAt: new Date() },
    })

    res.status(202).json({ message: 'Export started. You will receive an email shortly.' })

    // Fire and forget — reset lastDataExportAt if generation fails
    dataExportService.generateAndSend(userId).catch(async (err) => {
      console.error('[data-export] failed for user', userId, err)
      await prisma.user.update({
        where: { id: userId },
        data: { lastDataExportAt: null },
      }).catch(() => undefined)
    })
  } catch (err) {
    next(err)
  }
}
