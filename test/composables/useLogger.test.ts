import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LogLevel } from '../../src/runtime/types'
import type { LoggerConfig } from '../../src/runtime/types'

import { consoleTransport } from '../../src/runtime/transports/console'
import { apiTransport } from '../../src/runtime/transports/api'

vi.mock('../../src/runtime/transports/console', () => ({
  consoleTransport: vi.fn().mockResolvedValue(undefined),
}))
vi.mock('../../src/runtime/transports/file', () => ({
  fileTransport: vi.fn().mockResolvedValue(undefined),
}))
vi.mock('../../src/runtime/transports/api', () => ({
  apiTransport: vi.fn().mockResolvedValue(undefined),
}))

let mockLoggerConfig: Partial<LoggerConfig> = {}

vi.mock('#imports', () => ({
  useRuntimeConfig: () => ({
    public: { logger: mockLoggerConfig },
  }),
  useRoute: () => ({ fullPath: '/test' }),
}))

vi.mock('#app', () => ({
  defineNuxtPlugin: vi.fn(),
}))

const { useLogger } = await import('../../src/runtime/composables/useLogger')

describe('useLogger', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLoggerConfig = {}
  })

  it('exposes all log level methods', () => {
    const logger = useLogger()
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
    mockLoggerConfig = { output: ['console'] }
    const logger = useLogger()
    await logger.info('hello world')
    expect(consoleTransport).toHaveBeenCalledOnce()
  })

  it('does not log when output is empty', async () => {
    mockLoggerConfig = { output: [] }
    const logger = useLogger()
    await logger.info('silent')
    expect(consoleTransport).not.toHaveBeenCalled()
  })

  it('respects minLevel — skips below min', async () => {
    mockLoggerConfig = { output: ['console'], minLevel: LogLevel.ERROR }
    const logger = useLogger()
    await logger.info('should be skipped')
    expect(consoleTransport).not.toHaveBeenCalled()
  })

  it('respects minLevel — logs at or above min', async () => {
    mockLoggerConfig = { output: ['console'], minLevel: LogLevel.ERROR }
    const logger = useLogger()
    await logger.error('should log')
    expect(consoleTransport).toHaveBeenCalledOnce()
  })

  it('respects maxLevel — skips above max', async () => {
    mockLoggerConfig = { output: ['console'], maxLevel: LogLevel.WARNING }
    const logger = useLogger()
    await logger.error('should be skipped')
    expect(consoleTransport).not.toHaveBeenCalled()
  })

  it('respects allowedLevels', async () => {
    mockLoggerConfig = { output: ['console'], allowedLevels: [LogLevel.ERROR] }
    const logger = useLogger()
    await logger.info('not allowed')
    await logger.error('allowed')
    expect(consoleTransport).toHaveBeenCalledOnce()
  })

  it('beforeSend returning false stops the log', async () => {
    mockLoggerConfig = { output: ['console'], beforeSend: () => false }
    const logger = useLogger()
    await logger.info('blocked')
    expect(consoleTransport).not.toHaveBeenCalled()
  })

  it('beforeSend can mutate the payload', async () => {
    mockLoggerConfig = {
      output: ['console'],
      beforeSend: payload => ({ ...payload, message: 'mutated' }),
    }
    const logger = useLogger()
    await logger.info('original')
    const called = (consoleTransport as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(called.message).toContain('mutated')
  })

  it('afterSend is called after successful send', async () => {
    const afterSend = vi.fn()
    mockLoggerConfig = { output: ['console'], afterSend }
    const logger = useLogger()
    await logger.info('test')
    expect(afterSend).toHaveBeenCalledOnce()
  })

  it('masks keys from array config', async () => {
    mockLoggerConfig = { output: ['console'], mask: ['mobile'] }
    const logger = useLogger()
    await logger.info('test', { mobile: '09123456789' })
    const payload = (consoleTransport as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(payload.data.mobile).toBe('09****89')
  })

  it('masks keys from object config with false removes key', async () => {
    mockLoggerConfig = { output: ['console'], mask: { access_token: false } }
    const logger = useLogger()
    await logger.info('test', { access_token: 'secret' })
    const payload = (consoleTransport as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(payload.data).not.toHaveProperty('access_token')
  })

  it('uses per-level config override for output', async () => {
    mockLoggerConfig = {
      output: ['console'],
      levels: {
        [LogLevel.ERROR]: { output: ['api'], apiUrl: 'https://example.com/log' },
      },
    }
    const logger = useLogger()
    await logger.info('goes to console')
    await logger.error('goes to api')
    expect(consoleTransport).toHaveBeenCalledOnce()
    expect(apiTransport).toHaveBeenCalledOnce()
  })

  it('create() returns a log function for a given level', async () => {
    mockLoggerConfig = { output: ['console'] }
    const logger = useLogger()
    const logWarning = logger.create(LogLevel.WARNING)
    await logWarning('custom level log')
    expect(consoleTransport).toHaveBeenCalledOnce()
  })
})
