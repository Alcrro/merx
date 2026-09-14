import type { Response, NextFunction } from 'express'
import type { AuthenticatedRequest } from '../../../../middleware/authenticate'
import sharp from 'sharp'
import { prisma } from '../../../../lib/prisma'
import { storageProvider } from '../../../../lib/storage'

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_SIZE_BYTES = 2 * 1024 * 1024 // 2MB

export async function uploadAvatar(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const file = req.file
    if (!file) {
      res.status(400).json({ error: 'No file provided.' })
      return
    }
    if (!ALLOWED_TYPES.has(file.mimetype)) {
      res.status(400).json({ error: 'Only JPG, PNG and WebP are allowed.' })
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      res.status(400).json({ error: 'File exceeds 2MB limit.' })
      return
    }

    const compressed = await sharp(file.buffer)
      .resize(256, 256, { fit: 'cover' })
      .webp({ quality: 85 })
      .toBuffer()

    const key = `avatars/${req.user.userId}.webp`
    const url = await storageProvider.upload(key, compressed, 'image/webp')

    await prisma.user.update({
      where: { id: req.user.userId },
      data: { avatarUrl: url },
    })

    res.json({ avatarUrl: url })
  } catch (err) {
    next(err)
  }
}

export async function deleteAvatar(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { avatarUrl: true },
    })

    if (user?.avatarUrl) {
      const key = `avatars/${req.user.userId}.webp`
      await storageProvider.delete(key).catch(() => undefined)
    }

    await prisma.user.update({
      where: { id: req.user.userId },
      data: { avatarUrl: null },
    })

    res.sendStatus(204)
  } catch (err) {
    next(err)
  }
}
