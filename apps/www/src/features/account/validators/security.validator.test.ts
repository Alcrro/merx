import { describe, it, expect } from 'vitest'
import { AppError } from '@/errors/app.error'
import { validatePasswordChange, validatePasswordSet, validateRevokeSession } from './security.validator'

function makeForm(fields: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [k, v] of Object.entries(fields)) fd.append(k, v)
  return fd
}

describe('validatePasswordChange', () => {
  it('returns currentPassword and newPassword for valid input', () => {
    const result = validatePasswordChange(makeForm({
      currentPassword: 'oldpass1',
      newPassword: 'newpass1',
      confirmPassword: 'newpass1',
    }))
    expect(result).toEqual({ currentPassword: 'oldpass1', newPassword: 'newpass1' })
  })

  it('throws AppError when any field is missing', () => {
    expect(() => validatePasswordChange(makeForm({
      currentPassword: 'oldpass1',
      newPassword: 'newpass1',
    }))).toThrow(AppError)
  })

  it('throws AppError when new password is shorter than 8 chars', () => {
    expect(() => validatePasswordChange(makeForm({
      currentPassword: 'oldpass1',
      newPassword: 'short',
      confirmPassword: 'short',
    }))).toThrow(AppError)
  })

  it('throws AppError when passwords do not match', () => {
    expect(() => validatePasswordChange(makeForm({
      currentPassword: 'oldpass1',
      newPassword: 'newpass1',
      confirmPassword: 'different',
    }))).toThrow(AppError)
  })
})

describe('validatePasswordSet', () => {
  it('returns newPassword for valid input', () => {
    const result = validatePasswordSet(makeForm({
      newPassword: 'newpass1',
      confirmPassword: 'newpass1',
    }))
    expect(result).toEqual({ newPassword: 'newpass1' })
  })

  it('throws AppError when fields are missing', () => {
    expect(() => validatePasswordSet(makeForm({ newPassword: 'newpass1' }))).toThrow(AppError)
  })

  it('throws AppError when password is shorter than 8 chars', () => {
    expect(() => validatePasswordSet(makeForm({
      newPassword: 'short',
      confirmPassword: 'short',
    }))).toThrow(AppError)
  })

  it('throws AppError when passwords do not match', () => {
    expect(() => validatePasswordSet(makeForm({
      newPassword: 'newpass1',
      confirmPassword: 'mismatch',
    }))).toThrow(AppError)
  })
})

describe('validateRevokeSession', () => {
  it('returns tokenId for valid input', () => {
    const result = validateRevokeSession(makeForm({ tokenId: 'abc-123' }))
    expect(result).toEqual({ tokenId: 'abc-123' })
  })

  it('throws AppError when tokenId is missing', () => {
    expect(() => validateRevokeSession(makeForm({}))).toThrow(AppError)
  })
})
