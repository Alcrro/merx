import { z } from 'zod'

export const searchCatalogSchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const createCatalogProductSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  productType: z.string().max(100).optional().nullable(),
  status: z.enum(['pending', 'active', 'archived']).default('pending'),
  variants: z.array(z.object({
    title: z.string().min(1).max(255),
    sku: z.string().min(1).max(100),
    suggestedPrice: z.number().nonnegative(),
  })).optional(),
})

export const updateCatalogProductSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  productType: z.string().max(100).optional().nullable(),
  status: z.enum(['pending', 'active', 'archived']).optional(),
})

export const addVariantSchema = z.object({
  title: z.string().min(1).max(255),
  sku: z.string().min(1).max(100),
  suggestedPrice: z.number().nonnegative(),
})

export const updateVariantPriceSchema = z.object({
  customPrice: z.number().nonnegative().nullable(),
})

export const updateStoreProductSchema = z.object({
  shippingCost: z.number().nonnegative().optional(),
})

export const archiveCriteriaSchema = z.object({
  name: z.string().min(1).max(100),
  criteriaKey: z.string().min(1).max(100),
  value: z.string().min(1),
  enabled: z.boolean().default(true),
})

export const updateArchiveCriteriaSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  value: z.string().min(1).optional(),
  enabled: z.boolean().optional(),
})
