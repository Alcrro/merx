import { describe, it, expect } from 'vitest'
import { AuthValidationError } from '../errors'
import {
  loginSchema,
  signupSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  parseLogin,
  parseSignup,
  parseForgotPassword,
  parseResetPassword,
} from './auth.validator'

function makeForm(fields: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [k, v] of Object.entries(fields)) fd.append(k, v)
  return fd
}

// ─── loginSchema ─────────────────────────────────────────────────────────────

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    const result = loginSchema.safeParse({ email: 'alex@example.com', password: 'secret' })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'secret' })
    expect(result.success).toBe(false)
    expect(result.error?.errors[0].message).toBe('emailInvalid')
  })

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({ email: 'alex@example.com', password: '' })
    expect(result.success).toBe(false)
    expect(result.error?.errors[0].message).toBe('passwordRequired')
  })
})

// ─── signupSchema ─────────────────────────────────────────────────────────────

describe('signupSchema', () => {
  it('accepts valid signup data', () => {
    const result = signupSchema.safeParse({ name: 'Alex', email: 'alex@example.com', password: 'minimum8' })
    expect(result.success).toBe(true)
  })

  it('rejects empty name', () => {
    const result = signupSchema.safeParse({ name: '', email: 'alex@example.com', password: 'minimum8' })
    expect(result.success).toBe(false)
    expect(result.error?.errors[0].message).toBe('nameRequired')
  })

  it('rejects password shorter than 8 chars', () => {
    const result = signupSchema.safeParse({ name: 'Alex', email: 'alex@example.com', password: 'short' })
    expect(result.success).toBe(false)
    expect(result.error?.errors[0].message).toBe('passwordTooShort')
  })

  it('rejects invalid email', () => {
    const result = signupSchema.safeParse({ name: 'Alex', email: 'bad', password: 'minimum8' })
    expect(result.success).toBe(false)
    expect(result.error?.errors[0].message).toBe('emailInvalid')
  })
})

// ─── forgotPasswordSchema ─────────────────────────────────────────────────────

describe('forgotPasswordSchema', () => {
  it('accepts valid email', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'alex@example.com' })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'not-valid' })
    expect(result.success).toBe(false)
    expect(result.error?.errors[0].message).toBe('emailInvalid')
  })
})

// ─── resetPasswordSchema ──────────────────────────────────────────────────────

describe('resetPasswordSchema', () => {
  it('accepts valid token and password', () => {
    const result = resetPasswordSchema.safeParse({ token: 'abc123', password: 'newpassword' })
    expect(result.success).toBe(true)
  })

  it('rejects empty token', () => {
    const result = resetPasswordSchema.safeParse({ token: '', password: 'newpassword' })
    expect(result.success).toBe(false)
    expect(result.error?.errors[0].message).toBe('tokenRequired')
  })

  it('rejects password shorter than 8 chars', () => {
    const result = resetPasswordSchema.safeParse({ token: 'abc123', password: 'short' })
    expect(result.success).toBe(false)
    expect(result.error?.errors[0].message).toBe('passwordTooShort')
  })

  it('rejects password longer than 64 chars', () => {
    const result = resetPasswordSchema.safeParse({ token: 'abc123', password: 'a'.repeat(65) })
    expect(result.success).toBe(false)
    expect(result.error?.errors[0].message).toBe('passwordTooLong')
  })

  it('accepts password of exactly 64 chars', () => {
    const result = resetPasswordSchema.safeParse({ token: 'abc123', password: 'a'.repeat(64) })
    expect(result.success).toBe(true)
  })
})

// ─── parse* functions ─────────────────────────────────────────────────────────

describe('parseLogin', () => {
  it('returns parsed data from FormData', () => {
    const result = parseLogin(makeForm({ email: 'alex@example.com', password: 'pass' }))
    expect(result).toEqual({ email: 'alex@example.com', password: 'pass' })
  })

  it('throws AuthValidationError on invalid data', () => {
    expect(() => parseLogin(makeForm({ email: 'bad', password: 'pass' }))).toThrow(AuthValidationError)
  })
})

describe('parseSignup', () => {
  it('returns parsed data from FormData', () => {
    const result = parseSignup(makeForm({ name: 'Alex', email: 'alex@example.com', password: 'minimum8' }))
    expect(result).toEqual({ name: 'Alex', email: 'alex@example.com', password: 'minimum8' })
  })

  it('throws AuthValidationError on invalid data', () => {
    expect(() => parseSignup(makeForm({ name: '', email: 'alex@example.com', password: 'minimum8' }))).toThrow(AuthValidationError)
  })
})

describe('parseForgotPassword', () => {
  it('returns parsed data from FormData', () => {
    const result = parseForgotPassword(makeForm({ email: 'alex@example.com' }))
    expect(result).toEqual({ email: 'alex@example.com' })
  })

  it('throws AuthValidationError on invalid email', () => {
    expect(() => parseForgotPassword(makeForm({ email: 'bad' }))).toThrow(AuthValidationError)
  })
})

describe('parseResetPassword', () => {
  it('returns parsed data from FormData', () => {
    const result = parseResetPassword(makeForm({ token: 'tok', password: 'newpassword' }))
    expect(result).toEqual({ token: 'tok', password: 'newpassword' })
  })

  it('throws AuthValidationError on missing token', () => {
    expect(() => parseResetPassword(makeForm({ token: '', password: 'newpassword' }))).toThrow(AuthValidationError)
  })

  it('throws AuthValidationError on short password', () => {
    expect(() => parseResetPassword(makeForm({ token: 'tok', password: 'short' }))).toThrow(AuthValidationError)
  })
})
