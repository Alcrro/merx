import { z } from 'zod'

export const submitRequestSchema = z.object({
  requestedTitle: z.string().min(2).max(200),
  category: z.string().max(100).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
})

export const rejectRequestSchema = z.object({
  rejectionReason: z.string().max(500).optional(),
})

export const approveRequestSchema = z.object({
  catalogProductId: z.string().min(1),
})

export const listAdminRequestsSchema = z.object({
  status: z.enum(['pending', 'ai_processing', 'admin_review', 'approved', 'rejected']).optional(),
})
