import { LogLevel, type Config, type LogPayload, type OutputTarget } from '../types'
import { shouldLog } from './level'
import { applyMask } from './mask'
import { buildPayload } from './buildPayload'
import { buildMeta } from './buildMeta'
import { mergeConfigs } from './config/mergeConfigs'
import { consoleTransport } from '../transports/console'
import { fileTransport } from '../transports/file'
import { apiTransport } from '../transports/api'
import { stripCriticalMeta } from './config/stripCriticalMeta'
import type { ResolveReturnType } from './resolveConfig'

const transports: Record<OutputTarget, (payload: LogPayload, config: Config) => Promise<void>> = {
  console: consoleTransport,
  file: fileTransport,
  api: apiTransport,
} as const

export interface StateProvider {
  getResolved(): ResolveReturnType | null
  setResolved(value: ResolveReturnType): void
  getPromise(): Promise<ResolveReturnType | null> | null
  setPromise(promise: Promise<ResolveReturnType | null>): void
  getLocalOverrides(): Partial<Config>
  getDefaultConfigs(): Partial<Config>
}

export interface LoggerInstance {
  name: string
  send: (level: LogLevel, message: string, data?: Record<string, any>) => Promise<void>
  create: (level: LogLevel) => (message: string, data?: any) => Promise<void>
  debug: (message: string, data?: any) => Promise<void>
  info: (message: string, data?: any) => Promise<void>
  notice: (message: string, data?: any) => Promise<void>
  warning: (message: string, data?: any) => Promise<void>
  error: (message: string, data?: any) => Promise<void>
  critical: (message: string, data?: any) => Promise<void>
  alert: (message: string, data?: any) => Promise<void>
  emergency: (message: string, data?: any) => Promise<void>
}

export function createLoggerInstance(
  name: string,
  stateProvider: StateProvider,
): LoggerInstance {
  async function send(level: LogLevel, message: string, data?: Record<string, any>) {
    let resolved = stateProvider.getResolved()

    if (!resolved) {
      const pending = stateProvider.getPromise()
      if (pending) {
        await pending
        resolved = stateProvider.getResolved()
      }
    }

    if (!resolved) {
      console.warn(`[useLogger] Could not load config for "${name}". Log aborted.`)
      return
    }

    const localOverrides = stateProvider.getLocalOverrides()
    const defaultConfigs = stateProvider.getDefaultConfigs()

    const config = mergeConfigs(
      resolved.env,
      resolved.json,
      localOverrides,
      resolved.runtime,
      defaultConfigs,
    )

    const levelConfig = config.levels?.[level]
    const effectiveConfig = mergeConfigs(levelConfig || {}, config)
    if (effectiveConfig.enabled === false) return
    if (!shouldLog(level, effectiveConfig.minLevel, effectiveConfig.maxLevel, effectiveConfig.allowedLevels)) return

    let payload = buildPayload(
      { level, message, data, meta: buildMeta() },
      effectiveConfig,
    )

    if (effectiveConfig.beforeSend) {
      const result = effectiveConfig.beforeSend(payload)
      if (result === false) return
      if (result) payload = result
    }

    payload = applyMask(payload, effectiveConfig.mask)

    if (effectiveConfig.criticalMeta?.length && payload.meta && !import.meta.server) {
      payload = {
        ...payload,
        meta: stripCriticalMeta(payload.meta, effectiveConfig.criticalMeta),
      }
    }

    if (effectiveConfig.formatter) {
      payload = effectiveConfig.formatter({ payload, config: effectiveConfig })
    }

    const outputs: OutputTarget[] = effectiveConfig.output ?? ['console']

    await Promise.all(
      outputs.map(async (target) => {
        const transport = transports[target]
        if (transport) await transport(payload, effectiveConfig)
      }),
    )

    if (effectiveConfig.afterSend) {
      effectiveConfig.afterSend(payload)
    }
  }

  function create(level: LogLevel) {
    return (message: string, data?: any) => send(level, message, data)
  }

  return {
    name,
    send,
    create,
    debug: create(LogLevel.DEBUG),
    info: create(LogLevel.INFO),
    notice: create(LogLevel.NOTICE),
    warning: create(LogLevel.WARNING),
    error: create(LogLevel.ERROR),
    critical: create(LogLevel.CRITICAL),
    alert: create(LogLevel.ALERT),
    emergency: create(LogLevel.EMERGENCY),
  }
}
