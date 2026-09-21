import type { ErrorCode } from '@/errors/codes'

export type AuthFormState =
  | { status: 'success'; message?: string }
  | { status: 'error'; code: ErrorCode; message: string }
