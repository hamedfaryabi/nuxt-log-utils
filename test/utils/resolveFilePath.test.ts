import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { resolveFilePath } from '../../src/runtime/utils/resolveFilePath'

describe('resolveFilePath', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-19'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns original path when no period', () => {
    expect(resolveFilePath('logs/app.log')).toBe('logs/app.log')
  })

  it('appends daily suffix', () => {
    expect(resolveFilePath('logs/app.log', 'daily')).toBe('logs/app-2026-02-19.log')
  })

  it('appends monthly suffix', () => {
    expect(resolveFilePath('logs/app.log', 'monthly')).toBe('logs/app-2026-02.log')
  })

  it('appends yearly suffix', () => {
    expect(resolveFilePath('logs/app.log', 'yearly')).toBe('logs/app-2026.log')
  })

  it('handles paths with no extension', () => {
    expect(resolveFilePath('logs/app', 'daily')).toBe('logs/app-2026-02-19')
  })

  it('handles paths with multiple dots', () => {
    expect(resolveFilePath('logs/my.app.log', 'monthly')).toBe('logs/my.app-2026-02.log')
  })
})
