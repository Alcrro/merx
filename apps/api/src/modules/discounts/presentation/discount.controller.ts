import type { Request, Response, NextFunction } from 'express'
import type { AuthenticatedStoreRequest as AuthenticatedRequest } from '../../../middleware/authenticate'
import { discountService } from '../application/discount.service'
import {
  DiscountNotFoundError,
  DiscountCodeConflictError,
  DiscountInvalidError,
  DiscountMaxUsesReachedError,
} from '../domain/errors'
import { prisma } from '../../../lib/prisma'
import {
  createDiscountSchema,
  updateDiscountSchema,
  listDiscountsSchema,
  validateDiscountSchema,
} from './discount.schema'

function handleError(err: unknown, res: Response, next: NextFunction): void {
  if (err instanceof DiscountNotFoundError) { res.status(404).json({ error: err.message, code: err.code }); return }
  if (err instanceof DiscountCodeConflictError) { res.status(409).json({ error: err.message, code: err.code }); return }
  if (err instanceof DiscountInvalidError) { res.status(400).json({ error: err.message, code: err.code, minimumAmount: err.minimumAmount }); return }
  if (err instanceof DiscountMaxUsesReachedError) { res.status(409).json({ error: err.message, code: err.code }); return }
  next(err)
}

export const discountController = {
  list: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const parsed = listDiscountsSchema.safeParse(req.query)
      if (!parsed.success) { res.status(400).json({ error: 'Invalid query', details: parsed.error.flatten() }); return }
      const result = await discountService.getDiscounts({ storeId: req.user.storeId, ...parsed.data })
      res.json(result)
    } catch (err) { handleError(err, res, next) }
  },

  create: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const parsed = createDiscountSchema.safeParse(req.body)
      if (!parsed.success) { res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() }); return }
      const code = await discountService.createDiscount(req.user.storeId, {
        ...parsed.data,
        startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt) : undefined,
        expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : undefined,
      })
      res.status(201).json(code)
    } catch (err) { handleError(err, res, next) }
  },

  update: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const parsed = updateDiscountSchema.safeParse(req.body)
      if (!parsed.success) { res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() }); return }
      const code = await discountService.updateDiscount(req.params.id, req.user.storeId, {
        ...parsed.data,
        startsAt: parsed.data.startsAt !== undefined
          ? (parsed.data.startsAt ? new Date(parsed.data.startsAt) : null)
          : undefined,
        expiresAt: parsed.data.expiresAt !== undefined
          ? (parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null)
          : undefined,
      })
      res.json(code)
    } catch (err) { handleError(err, res, next) }
  },

  remove: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await discountService.softDeleteDiscount(req.params.id, req.user.storeId)
      res.status(204).send()
    } catch (err) { handleError(err, res, next) }
  },

  // Public — always 200, invaliditatea nu e eroare de protocol
  validate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { slug } = req.params
      const parsed = validateDiscountSchema.safeParse(req.body)
      if (!parsed.success) { res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() }); return }

      const store = await prisma.store.findUnique({ where: { slug } })
      if (!store) { res.status(404).json({ error: 'Store not found' }); return }

      // Recalculate subtotal server-side from variant prices
      const variantIds = parsed.data.items.map((i) => i.variantId)
      const variants = await prisma.productVariant.findMany({
        where: { id: { in: variantIds }, product: { storeId: store.id, status: 'active' } },
      })

      const subtotal = parsed.data.items.reduce((sum, item) => {
        const variant = variants.find((v) => v.id === item.variantId)
        if (!variant) return sum
        return sum + Number(variant.price) * item.quantity
      }, 0)

      const result = await discountService.validateCode(store.id, parsed.data.code, subtotal)
      res.json(result)
    } catch (err) { next(err) }
  },
}
