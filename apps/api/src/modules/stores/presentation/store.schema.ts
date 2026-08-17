import { z } from 'zod'

const storeSettingsSchema = z.object({
  business: z.object({
    companyName: z.string().max(200).optional(),
    vatNumber: z.string().max(50).optional(),
    contactEmail: z.string().email().optional().or(z.literal('')),
    phone: z.string().regex(/^\+[1-9]\d{6,14}$/, 'Număr de telefon invalid. Format: +40700000000').optional().or(z.literal('')),
    address: z.string().max(500).optional(),
    city: z.string().max(100).optional(),
    country: z.string().length(2).toUpperCase().optional().or(z.literal('')),
  }).optional(),
  notifications: z.object({
    orderCreated: z.boolean().optional(),
    lowStock: z.boolean().optional(),
    orderDelivered: z.boolean().optional(),
  }).optional(),
})

export const updateStoreSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  currency: z.string().length(3).toUpperCase().optional(),
  locale: z.string().min(2).max(10).optional(),
  timezone: z.string().min(1).optional(),
  settings: storeSettingsSchema.optional(),
})
