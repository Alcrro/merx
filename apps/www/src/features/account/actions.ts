'use server'

import { redirect } from 'next/navigation'
import { config } from '@/config'
import { revalidatePath } from 'next/cache'
import { getAccountUser } from '@/services/account'
import { clearSessionCookies } from '@/features/auth/services/session'
import { AppError } from '@/errors/app.error'
import { validateProfileUpdate, validateDeleteAccount } from './validators/profile.validator'
import { validatePasswordChange, validatePasswordSet, validateRevokeSession } from './validators/security.validator'
import {
  updateUserProfile,
  refreshDisplayCookie,
  verifyDeletePassword,
  softDeleteUser,
} from './services/profile.service'
import {
  getCurrentRefreshToken,
  verifyCurrentPassword,
  setUserPassword,
  updateUserPassword,
  revokeToken,
  revokeOtherTokens,
} from './services/security.service'
import {
  getAccessToken,
  cancelSubscriptionApi,
  undoCancelSubscriptionApi,
  upgradeSubscriptionApi,
  createPortalSessionApi,
  createCheckoutSessionApi,
} from './services/billing.api'
import type { AccountActionState, AccountActionResult } from './types'

export type { AccountActionState, AccountActionResult }

// ─── Profile ─────────────────────────────────────────────────────────────────

export async function uploadAvatarAction(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  try {
    const accessToken = await getAccessToken()
    if (!accessToken) return { status: 'error', message: 'Sesiunea a expirat. Reconectează-te.' }

    const file = formData.get('avatar') as File | null
    if (!file || file.size === 0) return { status: 'error', message: 'Niciun fișier selectat.' }

    const body = new FormData()
    body.append('avatar', file)

    const res = await fetch(`${config.api.url}/api/v1/me/avatar`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body,
      signal: AbortSignal.timeout(15000),
    })

    if (!res.ok) {
      const json = (await res.json().catch(() => ({}))) as { error?: string }
      return { status: 'error', message: json.error ?? 'Eroare la încărcare.' }
    }

    revalidatePath('/account/settings')
    revalidatePath('/account/profile')
    return { status: 'success', message: 'Fotografia a fost actualizată.' }
  } catch (err) {
    if (err instanceof AppError) return { status: 'error', message: err.userMessage }
    throw err
  }
}

export async function removeAvatarAction(
  _prev: AccountActionState,
  _formData: FormData
): Promise<AccountActionState> {
  try {
    const accessToken = await getAccessToken()
    if (!accessToken) return { status: 'error', message: 'Sesiunea a expirat. Reconectează-te.' }

    const res = await fetch(`${config.api.url}/api/v1/me/avatar`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) {
      const json = (await res.json().catch(() => ({}))) as { error?: string }
      return { status: 'error', message: json.error ?? 'Eroare la ștergere.' }
    }

    revalidatePath('/account/settings')
    revalidatePath('/account/profile')
    return { status: 'success', message: 'Fotografia a fost eliminată.' }
  } catch (err) {
    if (err instanceof AppError) return { status: 'error', message: err.userMessage }
    throw err
  }
}

export async function updateProfileAction(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  try {
    const user = await getAccountUser()
    if (!user) return { status: 'error', message: 'Sesiunea a expirat. Reconectează-te.' }

    const { name, preferredLocale } = validateProfileUpdate(formData)
    await updateUserProfile(user.id, name, preferredLocale)
    await refreshDisplayCookie(user.email, name)

    return { status: 'success', message: 'Profil actualizat.' }
  } catch (err) {
    if (err instanceof AppError) return { status: 'error', message: err.userMessage }
    throw err
  }
}

export async function requestExportAction(
  _prev: AccountActionState,
  _formData: FormData
): Promise<AccountActionState> {
  try {
    const accessToken = await getAccessToken()
    if (!accessToken) return { status: 'error', message: 'Sesiunea a expirat. Reconectează-te.' }

    const res = await fetch(`${config.api.url}/api/v1/me/export`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(10000),
    })

    if (res.status === 429) {
      return { status: 'error', message: 'Poți solicita un export o dată la 24 de ore.' }
    }
    if (!res.ok) {
      return { status: 'error', message: 'A apărut o eroare. Încearcă din nou.' }
    }

    return { status: 'success', message: 'Cerere înregistrată. Vei primi un email în câteva minute.' }
  } catch (err) {
    if (err instanceof AppError) return { status: 'error', message: err.userMessage }
    throw err
  }
}

export async function deleteAccountAction(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  try {
    const user = await getAccountUser()
    if (!user) return { status: 'error', message: 'Sesiunea a expirat. Reconectează-te.' }

    const { password } = validateDeleteAccount(formData, user.email)
    await verifyDeletePassword(user.password, password)
    await softDeleteUser(user.id)
    await clearSessionCookies()
  } catch (err) {
    if (err instanceof AppError) return { status: 'error', message: err.userMessage }
    throw err
  }
  redirect('/')
}

// ─── Security ────────────────────────────────────────────────────────────────

export async function changePasswordAction(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  try {
    const user = await getAccountUser()
    if (!user) return { status: 'error', message: 'Sesiunea a expirat. Reconectează-te.' }
    if (!user.password) return { status: 'error', message: 'Contul tău nu are o parolă setată.' }

    const { currentPassword, newPassword } = validatePasswordChange(formData)
    await verifyCurrentPassword(currentPassword, user.password)

    const currentToken = await getCurrentRefreshToken()
    await updateUserPassword(user.id, newPassword, currentToken)

    return { status: 'success', message: 'Parola a fost actualizată. Celelalte sesiuni au fost deconectate.' }
  } catch (err) {
    if (err instanceof AppError) return { status: 'error', message: err.userMessage }
    throw err
  }
}

export async function setPasswordAction(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  try {
    const user = await getAccountUser()
    if (!user) return { status: 'error', message: 'Sesiunea a expirat. Reconectează-te.' }
    if (user.password) return { status: 'error', message: 'Contul tău are deja o parolă setată.' }

    const { newPassword } = validatePasswordSet(formData)
    await setUserPassword(user.id, newPassword)

    return { status: 'success', message: 'Parola a fost setată. Poți folosi acum loginul cu email.' }
  } catch (err) {
    if (err instanceof AppError) return { status: 'error', message: err.userMessage }
    throw err
  }
}

export async function revokeSessionAction(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  try {
    const user = await getAccountUser()
    if (!user) return { status: 'error', message: 'Sesiunea a expirat. Reconectează-te.' }

    const { tokenId } = validateRevokeSession(formData)
    const currentToken = await getCurrentRefreshToken()
    await revokeToken(tokenId, user.id, currentToken)

    return { status: 'success', message: 'Sesiune deconectată.' }
  } catch (err) {
    if (err instanceof AppError) return { status: 'error', message: err.userMessage }
    throw err
  }
}

export async function revokeAllOtherSessionsAction(
  _prev: AccountActionState,
  _formData: FormData
): Promise<AccountActionState> {
  try {
    const user = await getAccountUser()
    if (!user) return { status: 'error', message: 'Sesiunea a expirat. Reconectează-te.' }

    const currentToken = await getCurrentRefreshToken()
    await revokeOtherTokens(user.id, currentToken)

    return { status: 'success', message: 'Toate celelalte sesiuni au fost deconectate.' }
  } catch (err) {
    if (err instanceof AppError) return { status: 'error', message: err.userMessage }
    throw err
  }
}

export async function unlinkGoogleAction(
  _prev: AccountActionState,
  _formData: FormData
): Promise<AccountActionState> {
  try {
    const accessToken = await getAccessToken()
    if (!accessToken) return { status: 'error', message: 'Sesiunea a expirat. Reconectează-te.' }

    const res = await fetch(`${config.api.url}/api/v1/auth/google`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string }
      return { status: 'error', message: body.error ?? 'A apărut o eroare.' }
    }

    revalidatePath('/account/security')
    return { status: 'success', message: 'Contul Google a fost deconectat.' }
  } catch (err) {
    if (err instanceof AppError) return { status: 'error', message: err.userMessage }
    throw err
  }
}

// ─── Billing ─────────────────────────────────────────────────────────────────

export async function cancelSubscriptionAction(
  _prev: AccountActionState,
  _formData: FormData
): Promise<AccountActionState> {
  try {
    const accessToken = await getAccessToken()
    if (!accessToken) return { status: 'error', message: 'Sesiunea a expirat. Reconectează-te.' }

    await cancelSubscriptionApi(accessToken)
    revalidatePath('/account/subscription')
    return { status: 'success', message: 'Abonamentul va fi anulat la sfârșitul perioadei curente.' }
  } catch (err) {
    if (err instanceof AppError) return { status: 'error', message: err.userMessage }
    throw err
  }
}

export async function undoCancelSubscriptionAction(
  _prev: AccountActionState,
  _formData: FormData
): Promise<AccountActionState> {
  try {
    const accessToken = await getAccessToken()
    if (!accessToken) return { status: 'error', message: 'Sesiunea a expirat. Reconectează-te.' }

    await undoCancelSubscriptionApi(accessToken)
    revalidatePath('/account/subscription')
    return { status: 'success', message: 'Anularea a fost revocată. Abonamentul continuă.' }
  } catch (err) {
    if (err instanceof AppError) return { status: 'error', message: err.userMessage }
    throw err
  }
}

export async function upgradeSubscriptionAction(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  try {
    const accessToken = await getAccessToken()
    if (!accessToken) return { status: 'error', message: 'Sesiunea a expirat. Reconectează-te.' }

    const planId = formData.get('planId') as string | null
    if (!planId) return { status: 'error', message: 'Plan invalid.' }

    // The API derives the current plan from the live subscription — the client only sends the target.
    await upgradeSubscriptionApi(accessToken, planId)
    revalidatePath('/account', 'layout')
    return { status: 'success', message: 'Planul a fost schimbat.' }
  } catch (err) {
    if (err instanceof AppError) return { status: 'error', message: err.userMessage }
    throw err
  }
}

export async function openBillingPortalAction(): Promise<never> {
  const accessToken = await getAccessToken()
  if (!accessToken) redirect('/login')

  const url = await createPortalSessionApi(accessToken)
  if (!url) redirect('/account/billing')
  redirect(url)
}

// ─── Checkout ────────────────────────────────────────────────────────────────

export async function createCheckoutAction(formData: FormData): Promise<never> {
  const planId = formData.get('planId') as string | null
  if (!planId) redirect('/account/subscription')

  const accessToken = await getAccessToken()
  if (!accessToken) redirect('/login')

  const sessionUrl = await createCheckoutSessionApi(accessToken, planId)
  if (!sessionUrl) redirect('/account/subscription?error=plan-not-configured')
  redirect(sessionUrl)
}
