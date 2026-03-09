import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LogLevel } from '../../src/runtime/types'
import { mergeConfigs } from '../../src/runtime/utils/config/mergeConfigs'
import { parseEnvConfig } from '../../src/runtime/utils/config/parseEnvConfig'
import { stripCriticalMeta } from '../../src/runtime/utils/config/stripCriticalMeta'

describe('mergeConfigs', () => {
  it('returns defaults when called with empty configs', () => {
    const result = mergeConfigs({})
    expect(result.minLevel).toBe(LogLevel.INFO)
    expect(result.includeMeta).toBe(true)
  })

  it('first argument has highest priority', () => {
    const result = mergeConfigs(
      { minLevel: LogLevel.ERROR },
      { minLevel: LogLevel.DEBUG },
    )
    expect(result.minLevel).toBe(LogLevel.ERROR)
  })

  it('merges fields from multiple configs', () => {
    const result = mergeConfigs(
      { output: ['console'] },
      { minLevel: LogLevel.DEBUG, includeMeta: false },
    )
    expect(result.output).toEqual(['console'])
    expect(result.minLevel).toBe(LogLevel.DEBUG)
    expect(result.includeMeta).toBe(false)
  })

  it('array fields use highest-priority source', () => {
    const result = mergeConfigs(
      { output: ['file'] },
      { output: ['console', 'api'] },
    )
    expect(result.output).toEqual(['file'])
  })

  it('allowedLevels from first config wins', () => {
    const result = mergeConfigs(
      { allowedLevels: [LogLevel.ERROR] },
      { allowedLevels: [LogLevel.DEBUG, LogLevel.INFO] },
    )
    expect(result.allowedLevels).toEqual([LogLevel.ERROR])
  })
})

describe('parseEnvConfig', () => {
  beforeEach(() => {
    for (const key of Object.keys(process.env)) {
      if (key.startsWith('LOGGER_')) delete process.env[key]
    }
  })

  it('returns empty object when no matching env vars exist', () => {
    expect(parseEnvConfig('default')).toEqual({})
  })

  it('parses simple key-value env var', () => {
    process.env.LOGGER_DEFAULT_MIN_LEVEL = '200'
    const result = parseEnvConfig('default')
    expect(result.minLevel).toBe(200)
  })

  it('parses comma-separated values as arrays', () => {
    process.env.LOGGER_DEFAULT_OUTPUT = 'console,file'
    const result = parseEnvConfig('default')
    expect(result.output).toEqual(['console', 'file'])
  })

  it('parses boolean values', () => {
    process.env.LOGGER_DEFAULT_INCLUDE_META = 'false'
    const result = parseEnvConfig('default')
    expect(result.includeMeta).toBe(false)
  })

  it('handles camelCase logger names', () => {
    process.env.LOGGER_MY_LOGGER_MIN_LEVEL = '300'
    const result = parseEnvConfig('myLogger')
    expect(result.minLevel).toBe(300)
  })

  it('handles nested keys with double underscore', () => {
    process.env.LOGGER_DEFAULT_LEVELS__ERROR__MIN_LEVEL = '400'
    const result = parseEnvConfig('default')
    expect(result.levels?.error?.minLevel).toBe(400)
  })
})

describe('stripCriticalMeta', () => {
  it('removes top-level keys', () => {
    const meta = { token: 'secret', name: 'Alice' }
    const result = stripCriticalMeta(meta, ['token'])
    expect(result).not.toHaveProperty('token')
    expect(result.name).toBe('Alice')
  })

  it('removes nested keys with dot notation', () => {
    const meta = { user: { token: 'secret', name: 'Alice' } }
    const result = stripCriticalMeta(meta, ['user.token'])
    expect(result.user).not.toHaveProperty('token')
    expect(result.user.name).toBe('Alice')
  })

  it('does not mutate the original meta', () => {
    const meta = { token: 'secret' }
    stripCriticalMeta(meta, ['token'])
    expect(meta.token).toBe('secret')
  })

  it('does not mutate nested objects in the original meta', () => {
    const meta = { user: { token: 'secret', name: 'Alice' } }
    stripCriticalMeta(meta, ['user.token'])
    expect(meta.user.token).toBe('secret')
    expect(meta.user.name).toBe('Alice')
  })

  it('handles empty critical array', () => {
    const meta = { token: 'secret' }
    const result = stripCriticalMeta(meta, [])
    expect(result.token).toBe('secret')
  })
})
