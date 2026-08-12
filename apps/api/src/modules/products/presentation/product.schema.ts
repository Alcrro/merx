import { z } from 'zod'

export const createProductSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional().nullable(),
  status: z.enum(['active', 'draft', 'archived']).default('draft'),
  categoryId: z.string().uuid().optional().nullable(),
  productType: z.string().max(100).optional().nullable(),
  vendor: z.string().max(100).optional().nullable(),
})

export const updateProductSchema = createProductSchema.partial()

export const createVariantSchema = z.object({
  sku: z.string().min(1).max(100),
  title: z.string().min(1).max(255),
  price: z.number().nonnegative(),
  compareAtPrice: z.number().nonnegative().optional().nullable(),
  cost: z.number().nonnegative().optional().nullable(),
  weight: z.number().nonnegative().optional().nullable(),
})

export const updateVariantSchema = createVariantSchema.partial()

export const listProductsSchema = z.object({
  status: z.enum(['active', 'draft', 'archived']).optional(),
  categoryId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
})
