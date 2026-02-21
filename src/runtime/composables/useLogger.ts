/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */

import { defu } from 'defu'
import type { LoggerConfig, LogPayload } from '../types'
import { LogLevel } from '../types'
import { shouldLog } from '../utils/level'
import { buildPayload } from '../utils/buildPayload'
import { consoleTransport } from '../transports/console'
import { fileTransport } from '../transports/file'
import { apiTransport } from '../transports/api'
import { useRuntimeConfig } from '#imports'

/**
 * Global logger composable
 */
export function useLogger(overrideConfig: LoggerConfig = {}) {
  const runtimeConfig = useRuntimeConfig().public.logger || {}

  const config = defu(
    overrideConfig,
    runtimeConfig,
    {
      level: LogLevel.DEBUG,
      output: ['console'],
      includeMeta: true,
    },
  ) as LoggerConfig

  async function send(payload: LogPayload) {
    if (!shouldLog(config.level!, payload.level as LogLevel)) return

    if (config.beforeSend) {
      const result = config.beforeSend(payload)
      if (result === false) return
      if (result) payload = result
    }

    const finalPayload = buildPayload(payload, config)
    const formatted = config.formatter
      ? config.formatter({ payload: finalPayload, config })
      : finalPayload

    for (const target of config.output!) {
      try {
        if (target === 'console') {
          await consoleTransport(formatted)
        }

        if (target === 'file') {
          if (import.meta.client && import.meta.dev) {
            console.warn('[Logger] file transport ignored on client')
            continue
          }
          await fileTransport(formatted, config.filePath || 'logs/app.log')
        }

        if (target === 'api') {
          await apiTransport(formatted, config.apiUrl!)
        }
      } catch (err) {
        if (import.meta.dev) console.error('[Logger error]', err)
      }
    }

    config.afterSend?.(finalPayload)
  }

  function create(level: LogLevel) {
    return (message: string, data?: any, options?: LoggerConfig) =>
      send({
        level,
        message,
        data,
        meta: options?.meta,
      })
  }

  return {
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
