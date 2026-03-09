import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LogLevel, type Config } from '../../src/runtime/types'
import type { ResolveReturnType } from '../../src/runtime/utils/resolveConfig'

import { consoleTransport } from '../../src/runtime/transports/console'
import { apiTransport } from '../../src/runtime/transports/api'

import { createLoggerInstance, type StateProvider } from '../../src/runtime/utils/loggerCore'

vi.mock('../../src/runtime/transports/console', () => ({
  consoleTransport: vi.fn().mockResolvedValue(undefined),
}))
vi.mock('../../src/runtime/transports/file', () => ({
  fileTransport: vi.fn().mockResolvedValue(undefined),
}))
vi.mock('../../src/runtime/transports/api', () => ({
  apiTransport: vi.fn().mockResolvedValue(undefined),
}))

function makeStateProvider(config: Partial<Config>): StateProvider {
  const resolved: ResolveReturnType = {
    env: {},
    json: {},
    runtime: {},
  }
  return {
    getResolved: () => resolved,
    setResolved: () => {},
    getPromise: () => Promise.resolve(resolved),
    setPromise: () => {},
    getLocalOverrides: () => config,
    getDefaultConfigs: () => ({}),
  }
}

describe('createLoggerInstance', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exposes all log level methods', () => {
    const logger = createLoggerInstance('default', makeStateProvider({}))
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
    const logger = createLoggerInstance('default', makeStateProvider({ output: ['console'] }))
    await logger.info('hello world')
    expect(consoleTransport).toHaveBeenCalledOnce()
  })

  it('does not log when output is empty', async () => {
    const logger = createLoggerInstance('default', makeStateProvider({ output: [] }))
    await logger.info('silent')
    expect(consoleTransport).not.toHaveBeenCalled()
  })

  it('respects minLevel — skips below min', async () => {
    const logger = createLoggerInstance('default', makeStateProvider({ output: ['console'], minLevel: LogLevel.ERROR }))
    await logger.info('should be skipped')
    expect(consoleTransport).not.toHaveBeenCalled()
  })

  it('respects minLevel — logs at or above min', async () => {
    const logger = createLoggerInstance('default', makeStateProvider({ output: ['console'], minLevel: LogLevel.ERROR }))
    await logger.error('should log')
    expect(consoleTransport).toHaveBeenCalledOnce()
  })

  it('respects maxLevel — skips above max', async () => {
    const logger = createLoggerInstance('default', makeStateProvider({ output: ['console'], maxLevel: LogLevel.WARNING }))
    await logger.error('should be skipped')
    expect(consoleTransport).not.toHaveBeenCalled()
  })

  it('respects allowedLevels', async () => {
    const logger = createLoggerInstance('default', makeStateProvider({ output: ['console'], allowedLevels: [LogLevel.ERROR] }))
    await logger.info('not allowed')
    await logger.error('allowed')
    expect(consoleTransport).toHaveBeenCalledOnce()
  })

  it('beforeSend returning false stops the log', async () => {
    const logger = createLoggerInstance('default', makeStateProvider({ output: ['console'], beforeSend: () => false }))
    await logger.info('blocked')
    expect(consoleTransport).not.toHaveBeenCalled()
  })

  it('beforeSend can mutate the payload', async () => {
    const logger = createLoggerInstance('default', makeStateProvider({
      output: ['console'],
      beforeSend: payload => ({ ...payload, message: 'mutated' }),
    }))
    await logger.info('original')
    const called = (consoleTransport as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(called.message).toContain('mutated')
  })

  it('afterSend is called after successful send', async () => {
    const afterSend = vi.fn()
    const logger = createLoggerInstance('default', makeStateProvider({ output: ['console'], afterSend }))
    await logger.info('test')
    expect(afterSend).toHaveBeenCalledOnce()
  })

  it('masks keys from array config', async () => {
    const logger = createLoggerInstance('default', makeStateProvider({ output: ['console'], mask: ['mobile'] }))
    await logger.info('test', { mobile: '09123456789' })
    const payload = (consoleTransport as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(payload.data.mobile).toBe('09****89')
  })

  it('masks keys from object config with false removes key', async () => {
    const logger = createLoggerInstance('default', makeStateProvider({ output: ['console'], mask: { access_token: false } }))
    await logger.info('test', { access_token: 'secret' })
    const payload = (consoleTransport as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(payload.data).not.toHaveProperty('access_token')
  })

  it('uses per-level config override for output', async () => {
    const logger = createLoggerInstance('default', makeStateProvider({
      output: ['console'],
      levels: {
        [LogLevel.ERROR]: { output: ['api'], apiUrl: 'https://example.com/log' },
      },
    }))
    await logger.info('goes to console')
    await logger.error('goes to api')
    expect(consoleTransport).toHaveBeenCalledOnce()
    expect(apiTransport).toHaveBeenCalledOnce()
  })

  it('create() returns a log function for a given level', async () => {
    const logger = createLoggerInstance('default', makeStateProvider({ output: ['console'] }))
    const logWarning = logger.create(LogLevel.WARNING)
    await logWarning('custom level log')
    expect(consoleTransport).toHaveBeenCalledOnce()
  })

  it('does not log when enabled is false', async () => {
    const logger = createLoggerInstance('default', makeStateProvider({ output: ['console'], enabled: false }))
    await logger.info('should not log')
    expect(consoleTransport).not.toHaveBeenCalled()
  })

  it('warns and aborts when config is not resolved', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const provider: StateProvider = {
      getResolved: () => null,
      setResolved: () => {},
      getPromise: () => null,
      setPromise: () => {},
      getLocalOverrides: () => ({}),
      getDefaultConfigs: () => ({}),
    }
    const logger = createLoggerInstance('broken', provider)
    await logger.info('will fail')
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('broken'))
    warnSpy.mockRestore()
  })
})
