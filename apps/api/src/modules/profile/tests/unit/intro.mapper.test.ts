import { describe, it, expect } from 'vitest'
import { introMapper } from '../../presentation/mappers/intro.mapper'
import { makeUserIntro } from '../fixtures/profile.fixtures'

describe('introMapper', () => {
  describe('toStateDto', () => {
    it('returns completed=false when intro is null', () => {
      expect(introMapper.toStateDto(null)).toEqual({ completed: false })
    })

    it('returns completed=false when intro not yet completed', () => {
      const intro = makeUserIntro({ completed: false })
      expect(introMapper.toStateDto(intro)).toEqual({ completed: false })
    })

    it('returns completed=true when intro is completed', () => {
      const intro = makeUserIntro({ completed: true })
      expect(introMapper.toStateDto(intro)).toEqual({ completed: true })
    })
  })

  describe('toCompleteDto', () => {
    it('returns completed=true and the provided userName', () => {
      expect(introMapper.toCompleteDto('Alex')).toEqual({ completed: true, userName: 'Alex' })
    })
  })
})
