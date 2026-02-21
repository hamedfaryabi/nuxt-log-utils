import { describe, it, expect } from 'vitest'
import { shouldLog } from '../../modules/logger/runtime/utils/level'
import { LogLevel } from '../../modules/logger/runtime/types'

describe('shouldLog', () => {
  it('returns true when no filters are set', () => {
    expect(shouldLog(LogLevel.INFO)).toBe(true)
  })

  it('filters by minLevel — below min returns false', () => {
    expect(shouldLog(LogLevel.DEBUG, LogLevel.INFO)).toBe(false)
  })

  it('filters by minLevel — at min returns true', () => {
    expect(shouldLog(LogLevel.INFO, LogLevel.INFO)).toBe(true)
  })

  it('filters by minLevel — above min returns true', () => {
    expect(shouldLog(LogLevel.ERROR, LogLevel.INFO)).toBe(true)
  })

  it('filters by maxLevel — above max returns false', () => {
    expect(shouldLog(LogLevel.ERROR, undefined, LogLevel.WARNING)).toBe(false)
  })

  it('filters by maxLevel — at max returns true', () => {
    expect(shouldLog(LogLevel.WARNING, undefined, LogLevel.WARNING)).toBe(true)
  })

  it('filters by min and max range', () => {
    expect(shouldLog(LogLevel.INFO, LogLevel.INFO, LogLevel.WARNING)).toBe(true)
    expect(shouldLog(LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARNING)).toBe(false)
    expect(shouldLog(LogLevel.ERROR, LogLevel.INFO, LogLevel.WARNING)).toBe(false)
  })

  it('allowedLevels overrides minLevel/maxLevel', () => {
    const allowed = [LogLevel.ERROR, LogLevel.CRITICAL]
    expect(shouldLog(LogLevel.ERROR, LogLevel.DEBUG, LogLevel.INFO, allowed)).toBe(true)
    expect(shouldLog(LogLevel.INFO, undefined, undefined, allowed)).toBe(false)
  })

  it('allowedLevels empty array returns false for all', () => {
    expect(shouldLog(LogLevel.INFO, undefined, undefined, [])).toBe(false)
  })
})
