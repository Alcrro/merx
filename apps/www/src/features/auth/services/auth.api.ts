import { AuthServerError, InvalidCredentialsError, EmailExistsError, InvalidTokenError } from '../errors'
import type { AuthSuccessResponse } from './session'
import type { LoginInput, SignupInput } from '../validators/auth.validator'
import { config } from '@/config'

interface AuthErrorResponse {
  message?: string
}

export async function loginApi(input: LoginInput, meta?: { userAgent?: string; ip?: string }): Promise<AuthSuccessResponse> {
  const extraHeaders: Record<string, string> = {}
  if (meta?.userAgent) extraHeaders['X-Forwarded-UA'] = meta.userAgent
  if (meta?.ip) extraHeaders['X-Real-IP'] = meta.ip

  let res: Response
  try {
    res = await fetch(`${config.api.url}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...extraHeaders },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(8000),
    })
  } catch {
    throw new AuthServerError()
  }

  if (!res.ok) {
    if (res.status === 401) throw new InvalidCredentialsError()
    await res.json().catch((): AuthErrorResponse => ({}))
    throw new AuthServerError()
  }

  return res.json() as Promise<AuthSuccessResponse>
}

export async function googleSignInApi(code: string, meta?: { userAgent?: string; ip?: string }): Promise<AuthSuccessResponse> {
  const extraHeaders: Record<string, string> = {}
  if (meta?.userAgent) extraHeaders['X-Forwarded-UA'] = meta.userAgent
  if (meta?.ip) extraHeaders['X-Real-IP'] = meta.ip

  let res: Response
  try {
    res = await fetch(`${config.api.url}/api/v1/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...extraHeaders },
      body: JSON.stringify({ code }),
      signal: AbortSignal.timeout(10000),
    })
  } catch {
    throw new AuthServerError()
  }

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) throw new InvalidCredentialsError()
    throw new AuthServerError()
  }

  return res.json() as Promise<AuthSuccessResponse>
}

export async function signupApi(input: SignupInput, meta?: { userAgent?: string; ip?: string }): Promise<AuthSuccessResponse> {
  const extraHeaders: Record<string, string> = {}
  if (meta?.userAgent) extraHeaders['X-Forwarded-UA'] = meta.userAgent
  if (meta?.ip) extraHeaders['X-Real-IP'] = meta.ip

  let res: Response
  try {
    res = await fetch(`${config.api.url}/api/v1/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...extraHeaders },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(8000),
    })
  } catch {
    throw new AuthServerError()
  }

  if (!res.ok) {
    if (res.status === 409) throw new EmailExistsError()
    throw new AuthServerError()
  }

  return res.json() as Promise<AuthSuccessResponse>
}

export async function forgotPasswordApi(email: string): Promise<void> {
  try {
    await fetch(`${config.api.url}/api/v1/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
      signal: AbortSignal.timeout(8000),
    })
  } catch {
    throw new AuthServerError()
  }
}

export async function resetPasswordApi(token: string, password: string): Promise<void> {
  let res: Response
  try {
    res = await fetch(`${config.api.url}/api/v1/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
      signal: AbortSignal.timeout(8000),
    })
  } catch {
    throw new AuthServerError()
  }

  if (!res.ok) {
    if (res.status === 400) throw new InvalidTokenError()
    throw new AuthServerError()
  }
}

export async function verifyEmailApi(token: string): Promise<void> {
  let res: Response
  try {
    res = await fetch(`${config.api.url}/api/v1/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
      signal: AbortSignal.timeout(8000),
    })
  } catch {
    throw new AuthServerError()
  }

  if (!res.ok) {
    if (res.status === 400) throw new InvalidTokenError()
    throw new AuthServerError()
  }
}

export async function resendVerificationApi(accessToken: string): Promise<void> {
  let res: Response
  try {
    res = await fetch(`${config.api.url}/api/v1/auth/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      signal: AbortSignal.timeout(8000),
    })
  } catch {
    throw new AuthServerError()
  }

  if (!res.ok) throw new AuthServerError()
}
