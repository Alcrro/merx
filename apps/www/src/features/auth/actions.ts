'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { AppError } from '@/errors/app.error'
import { getAccessToken } from '@/lib/auth/access-token'
import { parseLogin, parseSignup, parseForgotPassword, parseResetPassword } from './validators/auth.validator'
import { loginApi, signupApi, forgotPasswordApi, resetPasswordApi, verifyEmailApi, resendVerificationApi } from './services/auth.api'
import { setSessionCookies, clearSessionCookies, revokeCurrentSession } from './services/session'
import type { AuthFormState } from './types'

export type { AuthFormState }

async function getRequestMeta() {
  const hdrs = await headers()
  const userAgent = hdrs.get('user-agent') ?? undefined
  const ip = hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() ?? hdrs.get('x-real-ip') ?? undefined
  return { userAgent, ip }
}

export async function loginAction(_prev: AuthFormState | null, formData: FormData): Promise<AuthFormState | null> {
  try {
    const input = parseLogin(formData)
    const meta = await getRequestMeta()
    await revokeCurrentSession()
    const data = await loginApi(input, meta)
    await setSessionCookies(data.refreshToken, data.platformToken, data.user)
    redirect('/account')
  } catch (err) {
    if (err instanceof AppError) return { status: 'error', code: err.code, message: err.userMessage }
    throw err
  }
}

export async function signupAction(_prev: AuthFormState | null, formData: FormData): Promise<AuthFormState | null> {
  try {
    const input = parseSignup(formData)
    const meta = await getRequestMeta()
    const data = await signupApi(input, meta)
    await setSessionCookies(data.refreshToken, data.platformToken, { name: input.name, email: input.email, avatarUrl: null })
    redirect('/account')
  } catch (err) {
    if (err instanceof AppError) return { status: 'error', code: err.code, message: err.userMessage }
    throw err
  }
}

export async function logoutAction() {
  await clearSessionCookies()
  redirect('/')
}

export async function forgotPasswordAction(_prev: AuthFormState | null, formData: FormData): Promise<AuthFormState> {
  try {
    const { email } = parseForgotPassword(formData)
    await forgotPasswordApi(email)
    return { status: 'success' }
  } catch (err) {
    if (err instanceof AppError) return { status: 'error', code: err.code, message: err.userMessage }
    throw err
  }
}

export async function resetPasswordAction(_prev: AuthFormState | null, formData: FormData): Promise<AuthFormState> {
  try {
    const { token, password } = parseResetPassword(formData)
    await resetPasswordApi(token, password)
    redirect('/login?reset=1')
  } catch (err) {
    if (err instanceof AppError) return { status: 'error', code: err.code, message: err.userMessage }
    throw err
  }
}

export async function verifyEmailAction(token: string): Promise<AuthFormState> {
  try {
    await verifyEmailApi(token)
    return { status: 'success' }
  } catch (err) {
    if (err instanceof AppError) return { status: 'error', code: err.code, message: err.userMessage }
    throw err
  }
}

export async function resendVerificationAction(): Promise<AuthFormState> {
  try {
    const accessToken = await getAccessToken()
    if (!accessToken) return { status: 'error', code: 'AUTH_SERVER_ERROR', message: 'serverError' }

    await resendVerificationApi(accessToken)
    return { status: 'success' }
  } catch (err) {
    if (err instanceof AppError) return { status: 'error', code: err.code, message: err.userMessage }
    throw err
  }
}
