import { AppError } from '@/errors/app.error'
import { ErrorCode } from '@/errors/codes'

function accountError(userMessage: string) {
  return new AppError(userMessage, userMessage, ErrorCode.ACCOUNT_VALIDATION, 422)
}

export function validatePasswordChange(formData: FormData): {
  currentPassword: string
  newPassword: string
} {
  const currentPassword = formData.get('currentPassword') as string | null
  const newPassword = formData.get('newPassword') as string | null
  const confirmPassword = formData.get('confirmPassword') as string | null

  if (!currentPassword || !newPassword || !confirmPassword)
    throw accountError('Toate câmpurile sunt obligatorii.')
  if (newPassword.length < 8)
    throw accountError('Parola nouă trebuie să aibă cel puțin 8 caractere.')
  if (newPassword !== confirmPassword)
    throw accountError('Parolele nu se potrivesc.')

  return { currentPassword, newPassword }
}

export function validatePasswordSet(formData: FormData): { newPassword: string } {
  const newPassword = formData.get('newPassword') as string | null
  const confirmPassword = formData.get('confirmPassword') as string | null

  if (!newPassword || !confirmPassword)
    throw accountError('Toate câmpurile sunt obligatorii.')
  if (newPassword.length < 8)
    throw accountError('Parola trebuie să aibă cel puțin 8 caractere.')
  if (newPassword !== confirmPassword)
    throw accountError('Parolele nu se potrivesc.')

  return { newPassword }
}

export function validateRevokeSession(formData: FormData): { tokenId: string } {
  const tokenId = formData.get('tokenId') as string | null
  if (!tokenId) throw accountError('ID sesiune lipsă.')
  return { tokenId }
}
