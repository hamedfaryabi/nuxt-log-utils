import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { LogLevel } from '../../modules/logger/runtime/types'

import { useLogger } from '../../modules/logger/runtime/composables/useLogger'
import { consoleTransport } from '../../modules/logger/runtime/transports/console'
import { apiTransport } from '../../modules/logger/runtime/transports/api'

// Mock runtime config
mockNuxtImport('useRuntimeConfig', () => () => ({
  public: { logger: {} },
}))

// Mock transports
vi.mock('../../modules/logger/runtime/transports/console', () => ({
  consoleTransport: vi.fn().mockResolvedValue(undefined),
}))
vi.mock('../../modules/logger/runtime/transports/file', () => ({
  fileTransport: vi.fn().mockResolvedValue(undefined),
}))
vi.mock('../../modules/logger/runtime/transports/api', () => ({
  apiTransport: vi.fn().mockResolvedValue(undefined),
}))

describe('useLogger', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exposes all log level methods', () => {
    const logger = useLogger({ output: ['console'] })
    expect(typeof logger.debug).toBe('function')
    expect(typeof logger.info).toBe('function')
    expect(typeof logger.notice).toBe('function')
    expect(typeof logger.warning).toBe('function')
    expect(typeof logger.error).toBe('function')
    expect(typeof logger.critical).toBe('function')
    expect(typeof logger.alert).toBe('function')
    expect(typeof logger.emergency).toBe('function')
    expect(typeof logger.create).toBe('function')
  })

  it('calls consoleTransport when output includes console', async () => {
    const logger = useLogger({ output: ['console'] })
    await logger.info('hello world')
    expect(consoleTransport).toHaveBeenCalledOnce()
  })

  it('does not log when output is empty', async () => {
    const logger = useLogger({ output: [] })
    await logger.info('silent')
    expect(consoleTransport).not.toHaveBeenCalled()
  })

  it('respects minLevel — skips below min', async () => {
    const logger = useLogger({ output: ['console'], minLevel: LogLevel.ERROR })
    await logger.info('should be skipped')
    expect(consoleTransport).not.toHaveBeenCalled()
  })

  it('respects minLevel — logs at or above min', async () => {
    const logger = useLogger({ output: ['console'], minLevel: LogLevel.ERROR })
    await logger.error('should log')
    expect(consoleTransport).toHaveBeenCalledOnce()
  })

  it('respects maxLevel — skips above max', async () => {
    const logger = useLogger({ output: ['console'], maxLevel: LogLevel.WARNING })
    await logger.error('should be skipped')
    expect(consoleTransport).not.toHaveBeenCalled()
  })

  it('respects allowedLevels', async () => {
    const logger = useLogger({
      output: ['console'],
      allowedLevels: [LogLevel.ERROR],
    })
    await logger.info('not allowed')
    await logger.error('allowed')
    expect(consoleTransport).toHaveBeenCalledOnce()
  })

  it('beforeSend returning false stops the log', async () => {
    const logger = useLogger({
      output: ['console'],
      beforeSend: () => false,
    })
    await logger.info('blocked')
    expect(consoleTransport).not.toHaveBeenCalled()
  })

  it('beforeSend can mutate the payload', async () => {
    const logger = useLogger({
      output: ['console'],
      beforeSend: payload => ({ ...payload, message: 'mutated' }),
    })
    await logger.info('original')
    const called = (consoleTransport as any).mock.calls[0][0]
    expect(called.message).toContain('mutated')
  })

  it('afterSend is called after successful send', async () => {
    const afterSend = vi.fn()
    const logger = useLogger({ output: ['console'], afterSend })
    await logger.info('test')
    expect(afterSend).toHaveBeenCalledOnce()
  })

  it('masks keys from array config', async () => {
    const logger = useLogger({
      output: ['console'],
      mask: ['mobile'],
    })
    await logger.info('test', { mobile: '09123456789' })
    const payload = (consoleTransport as any).mock.calls[0][0]
    expect(payload.data.mobile).toBe('09****89')
  })

  it('masks keys from object config with false removes key', async () => {
    const logger = useLogger({
      output: ['console'],
      mask: { access_token: false },
    })
    await logger.info('test', { access_token: 'secret' })
    const payload = (consoleTransport as any).mock.calls[0][0]
    expect(payload.data).not.toHaveProperty('access_token')
  })

  it('uses per-level config override for output', async () => {
    const logger = useLogger({
      output: ['console'],
      levels: {
        ERROR: { output: ['api'], apiUrl: 'https://example.com/log' },
      },
    })
    await logger.info('goes to console')
    await logger.error('goes to api')
    expect(consoleTransport).toHaveBeenCalledOnce()
    expect(apiTransport).toHaveBeenCalledOnce()
  })

  it('create() returns a log function for a given level', async () => {
    const logger = useLogger({ output: ['console'] })
    const logWarning = logger.create(LogLevel.WARNING)
    await logWarning('custom level log')
    expect(consoleTransport).toHaveBeenCalledOnce()
  })
})
