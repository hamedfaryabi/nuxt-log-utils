// src/runtime/composables/useLogger.ts
import { useRuntimeConfig } from '#imports'
import { LogLevel, type LoggerConfig, type LogPayload, type OutputTarget } from '../types'
import { resolveConfig } from '../utils/resolveConfig'
import { shouldLog } from '../utils/level'
import { applyMask } from '../utils/mask'
import { buildPayload } from '../utils/buildPayload'
import { buildMeta } from '../utils/buildMeta'
import { consoleTransport } from '../transports/console'
import { fileTransport } from '../transports/file'
import { apiTransport } from '../transports/api'

const transports: Record<OutputTarget, (payload: LogPayload, config: LoggerConfig) => Promise<void>> = {
  console: consoleTransport,
  file: fileTransport,
  api: apiTransport,
} as const

export function useLogger(name?: string, configs?: Partial<LoggerConfig>) {
  const globalConfig = useRuntimeConfig().public.logger as Partial<LoggerConfig>
 
  async function send(level: LogLevel, message: string, data?: Record<string, any>) {
    const config = resolveConfig(configs || {}, globalConfig, name, level)

    if (!shouldLog(level, config.minLevel, config.maxLevel, config.allowedLevels)) return

    let payload = buildPayload({ level, message, data, meta: buildMeta() }, config)

    if (config.beforeSend) {
      const result = await config.beforeSend(payload)
      if (result === false) return
      if (result) payload = result
    }

    payload = applyMask(payload, config.mask)

    if (config.formatter) {
      payload = config.formatter({ payload, config })
    }

    const outputs: OutputTarget[] = config.output ?? ['console']

    await Promise.all(
      outputs.map(async (t) => {
        const transport = transports[t]
        if (transport) await transport(payload, config)
      })
    )

    if (config.afterSend) {
      await config.afterSend(payload)
    }
  }

  function create(level: LogLevel) {
    return (message: string, data?: any) =>
      send(level, message, data)
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
