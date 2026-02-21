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
import { applyMask } from '../utils/mask'
import { resolveFilePath } from '../utils/resolveFilePath'
import { resolveConfig } from '../utils/resolveConfig'

/**
 * Global logger composable
 */
export function useLogger(overrideConfig: LoggerConfig = {}) {
  const runtimeConfig = useRuntimeConfig().public.logger || {}

  const DEFAULT_CONFIGS: LoggerConfig = {
    minLevel: LogLevel.DEBUG,
    includeMeta: true,
  }

  const config = defu(
    overrideConfig,
    runtimeConfig,
    DEFAULT_CONFIGS,
  ) as LoggerConfig

  async function send(payload: LogPayload) {
    const level = payload.level as LogLevel

    // Resolve effective config for this level
    const effectiveConfig = resolveConfig(config, level)

    if (!shouldLog(
      level,
      effectiveConfig.minLevel,
      effectiveConfig.maxLevel,
      effectiveConfig.allowedLevels,
    )) return

    // 1. beforeSend hook
    if (effectiveConfig.beforeSend) {
      const result = effectiveConfig.beforeSend(payload)
      if (result === false) return
      if (result) payload = result
    }

    // 2. Apply masking (after beforeSend, before formatter)
    if (effectiveConfig.mask) {
      payload = {
        ...payload,
        data: payload.data ? applyMask(payload.data, effectiveConfig.mask) : payload.data,
        meta: payload.meta ? applyMask(payload.meta, effectiveConfig.mask) : payload.meta,
      }
    }

    // 3. Build payload & format
    const finalPayload = buildPayload(payload, effectiveConfig)
    const formatted = effectiveConfig.formatter
      ? effectiveConfig.formatter({ payload: finalPayload, config })
      : finalPayload

    for (const target of effectiveConfig.output ?? []) {
      try {
        if (target === 'console') {
          await consoleTransport(formatted)
        }

        if (target === 'file') {
          if (import.meta.client && import.meta.dev) {
            console.warn('[Logger] file transport ignored on client')
            continue
          }
          const resolvedPath = resolveFilePath(
            effectiveConfig.filePath || 'logs/app.log',
            effectiveConfig.fileLogPeriod,
          )
          await fileTransport(formatted, resolvedPath)
        }

        if (target === 'api') {
          await apiTransport(formatted, effectiveConfig.apiUrl!)
        }
      } catch (err) {
        if (import.meta.dev) console.error('[Logger error]', err)
      }
    }

    // 4. afterSend hook
    effectiveConfig.afterSend?.(finalPayload)
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
    create,
  }
}
