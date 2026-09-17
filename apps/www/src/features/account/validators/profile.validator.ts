import { AppError } from '@/errors/app.error'
import { ErrorCode } from '@/errors/codes'

function accountError(userMessage: string) {
  return new AppError(userMessage, userMessage, ErrorCode.ACCOUNT_VALIDATION, 422)
}

export function validateProfileUpdate(formData: FormData): { name: string; preferredLocale: string } {
  const name = (formData.get('name') as string | null)?.trim()
  const preferredLocale = formData.get('preferredLocale') as string | null

  if (!name) throw accountError('Numele este obligatoriu.')
  if (!['ro', 'en'].includes(preferredLocale ?? '')) throw accountError('Limbă invalidă.')

  return { name, preferredLocale: preferredLocale! }
}

export function validateDeleteAccount(
  formData: FormData,
  userEmail: string
): { password: string | null } {
  const confirmedEmail = (formData.get('email') as string | null)?.trim().toLowerCase()
  const password = formData.get('password') as string | null

  if (confirmedEmail !== userEmail.toLowerCase())
    throw accountError('Email-ul nu corespunde cu contul tău.')

  return { password }
}
