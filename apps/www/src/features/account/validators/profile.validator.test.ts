import { describe, it, expect } from 'vitest'
import { AppError } from '@/errors/app.error'
import { validateProfileUpdate, validateDeleteAccount } from './profile.validator'

function makeForm(fields: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [k, v] of Object.entries(fields)) fd.append(k, v)
  return fd
}

describe('validateProfileUpdate', () => {
  it('returns name and locale for valid input', () => {
    const result = validateProfileUpdate(makeForm({ name: 'Alex', preferredLocale: 'ro' }))
    expect(result).toEqual({ name: 'Alex', preferredLocale: 'ro' })
  })

  it('accepts "en" as locale', () => {
    const result = validateProfileUpdate(makeForm({ name: 'Alex', preferredLocale: 'en' }))
    expect(result.preferredLocale).toBe('en')
  })

  it('trims whitespace from name', () => {
    const result = validateProfileUpdate(makeForm({ name: '  Alex  ', preferredLocale: 'ro' }))
    expect(result.name).toBe('Alex')
  })

  it('throws AppError when name is empty', () => {
    expect(() => validateProfileUpdate(makeForm({ name: '', preferredLocale: 'ro' }))).toThrow(AppError)
  })

  it('throws AppError when name is only whitespace', () => {
    expect(() => validateProfileUpdate(makeForm({ name: '   ', preferredLocale: 'ro' }))).toThrow(AppError)
  })

  it('throws AppError when locale is invalid', () => {
    expect(() => validateProfileUpdate(makeForm({ name: 'Alex', preferredLocale: 'fr' }))).toThrow(AppError)
  })

  it('throws AppError when locale is missing', () => {
    expect(() => validateProfileUpdate(makeForm({ name: 'Alex', preferredLocale: '' }))).toThrow(AppError)
  })
})

describe('validateDeleteAccount', () => {
  it('returns password when email matches', () => {
    const result = validateDeleteAccount(makeForm({ email: 'alex@example.com', password: 'pass' }), 'alex@example.com')
    expect(result).toEqual({ password: 'pass' })
  })

  it('is case-insensitive for email comparison', () => {
    const result = validateDeleteAccount(makeForm({ email: 'ALEX@EXAMPLE.COM', password: 'pass' }), 'alex@example.com')
    expect(result.password).toBe('pass')
  })

  it('returns null password when no password field', () => {
    const result = validateDeleteAccount(makeForm({ email: 'alex@example.com' }), 'alex@example.com')
    expect(result.password).toBeNull()
  })

  it('throws AppError when email does not match', () => {
    expect(() =>
      validateDeleteAccount(makeForm({ email: 'wrong@example.com', password: 'pass' }), 'alex@example.com')
    ).toThrow(AppError)
  })
})
