import { describe, it, expect } from 'vitest'
import { ValidationError } from '../errors'
import { parseContact } from './contact.validator'

function makeForm(fields: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [k, v] of Object.entries(fields)) fd.append(k, v)
  return fd
}

const valid = {
  name: 'Alexandru',
  email: 'alex@example.com',
  topic: 'support',
  body: 'Am o întrebare despre produsul vostru.',
}

describe('parseContact', () => {
  it('returns parsed data for valid input', () => {
    const result = parseContact(makeForm(valid))
    expect(result).toEqual(valid)
  })

  it('throws ValidationError when name is too short', () => {
    expect(() => parseContact(makeForm({ ...valid, name: 'A' }))).toThrow(ValidationError)
  })

  it('throws ValidationError when email is invalid', () => {
    expect(() => parseContact(makeForm({ ...valid, email: 'not-an-email' }))).toThrow(ValidationError)
  })

  it('throws ValidationError when topic is not in allowed list', () => {
    expect(() => parseContact(makeForm({ ...valid, topic: 'hacking' }))).toThrow(ValidationError)
  })

  it('accepts all valid topic keys', () => {
    const topics = ['sales', 'support', 'legal', 'press', 'other'] as const
    for (const topic of topics) {
      expect(() => parseContact(makeForm({ ...valid, topic }))).not.toThrow()
    }
  })

  it('throws ValidationError when body is too short', () => {
    expect(() => parseContact(makeForm({ ...valid, body: 'Scurt' }))).toThrow(ValidationError)
  })

  it('throws ValidationError when body exceeds 2000 chars', () => {
    expect(() => parseContact(makeForm({ ...valid, body: 'a'.repeat(2001) }))).toThrow(ValidationError)
  })

  it('accepts body of exactly 2000 chars', () => {
    expect(() => parseContact(makeForm({ ...valid, body: 'a'.repeat(2000) }))).not.toThrow()
  })
})
