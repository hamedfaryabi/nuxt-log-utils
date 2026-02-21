import { describe, it, expect } from 'vitest'
import { applyMask } from '../../modules/logger/runtime/utils/mask'

describe('applyMask - array mode', () => {
  it('masks matched keys with default masker', () => {
    const result = applyMask({ mobile: '09123456789' }, ['mobile'])
    expect(result.mobile).toBe('09****89')
  })

  it('does not touch unmatched keys', () => {
    const result = applyMask({ name: 'Alice', mobile: '09123456789' }, ['mobile'])
    expect(result.name).toBe('Alice')
  })

  it('masks short values with only stars', () => {
    const result = applyMask({ token: 'ab' }, ['token'])
    expect(result.token).toBe('****')
  })

  it('recursively masks nested objects', () => {
    const result = applyMask({ user: { mobile: '09123456789' } }, ['mobile'])
    expect(result.user.mobile).toBe('09****89')
  })

  it('does not mutate the original object', () => {
    const original = { mobile: '09123456789' }
    applyMask(original, ['mobile'])
    expect(original.mobile).toBe('09123456789')
  })
})

describe('applyMask - object mode', () => {
  it('applies custom function masker', () => {
    const result = applyMask(
      { mobile: '09123456789' },
      { mobile: (v: string) => v.substring(0, 4) + '****' },
    )
    expect(result.mobile).toBe('0912****')
  })

  it('removes key when masker is false', () => {
    const result = applyMask({ access_token: 'secret', name: 'Alice' }, { access_token: false })
    expect(result).not.toHaveProperty('access_token')
    expect(result.name).toBe('Alice')
  })

  it('applies default mask when masker is undefined for key', () => {
    const result = applyMask({ mobile: '09123456789' }, { mobile: v => v.slice(0, 3) })
    expect(result.mobile).toBe('091')
  })

  it('recursively applies object mask to nested data', () => {
    const result = applyMask(
      { user: { access_token: 'secret123' } },
      { access_token: false },
    )
    expect(result.user).not.toHaveProperty('access_token')
  })
})

describe('applyMask - edge cases', () => {
  it('returns primitives as-is', () => {
    expect(applyMask('string', ['key'])).toBe('string')
    expect(applyMask(null, ['key'])).toBe(null)
    expect(applyMask(undefined, ['key'])).toBe(undefined)
  })

  it('handles arrays inside object values', () => {
    const result = applyMask({ items: [{ mobile: '09123456789' }] }, ['mobile'])
    expect(result.items[0].mobile).toBe('09****89')
  })
})
