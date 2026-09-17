import type { ErrorCode } from '@/errors/codes'

export interface ContactFormState {
  status: 'idle' | 'success' | 'error'
  code?: ErrorCode
  message?: string
  responseTimeKey?: string
}
