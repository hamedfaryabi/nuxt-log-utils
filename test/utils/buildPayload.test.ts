import { describe, it, expect } from 'vitest'
import { buildPayload } from '../../src/runtime/utils/buildPayload'
import { LogLevel } from '../../src/runtime/types'

describe('buildPayload', () => {
  it('normalizes level to numeric and prepends level tag to message', () => {
    const result = buildPayload(
      { level: LogLevel.INFO, message: 'hello', meta: {} },
      { includeMeta: true },
    )
    expect(result.level).toBe(LogLevel.INFO)
    expect(result.message).toBe('[INFO] hello')
  })

  it('merges config meta into payload meta when includeMeta is not false', () => {
    const result = buildPayload(
      { level: LogLevel.DEBUG, message: 'test', meta: { timestamp: 'now' } },
      { includeMeta: true, meta: { app: 'myApp' } },
    )
    expect(result.meta?.app).toBe('myApp')
    expect(result.meta?.timestamp).toBe('now')
  })

  it('does not merge config meta when includeMeta is false', () => {
    const result = buildPayload(
      { level: LogLevel.DEBUG, message: 'test', meta: { timestamp: 'now' } },
      { includeMeta: false, meta: { app: 'myApp' } },
    )
    expect(result.meta?.app).toBeUndefined()
    expect(result.meta?.timestamp).toBe('now')
  })

  it('passes data through unchanged', () => {
    const data = { userId: 42 }
    const result = buildPayload(
      { level: LogLevel.ERROR, message: 'fail', data, meta: {} },
      {},
    )
    expect(result.data).toEqual(data)
  })
})
