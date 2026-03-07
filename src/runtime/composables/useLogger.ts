// src/runtime/composables/useLogger.ts
import { LogLevel, type Config, type LoggerConfig, type LogPayload, type OutputTarget } from '../types'
import { resolveConfig, type ResolveReturnType } from '../utils/resolveConfig'
import { shouldLog } from '../utils/level'
import { applyMask } from '../utils/mask'
import { buildPayload } from '../utils/buildPayload'
import { buildMeta } from '../utils/buildMeta'
import { consoleTransport } from '../transports/console'
import { fileTransport } from '../transports/file'
import { apiTransport } from '../transports/api'
import { mergeConfigs } from '../utils/config/mergeConfigs'

const transports: Record<OutputTarget, (payload: LogPayload, config: Config) => Promise<void>> = {
  console: consoleTransport,
  file: fileTransport,
  api: apiTransport,
} as const

export function useLogger(name: string, configs?: Partial<Config>): ReturnType<typeof _useLogger>
export function useLogger(configs?: Partial<Config>): ReturnType<typeof _useLogger>

export function useLogger(
  nameOrConfigs?: string | Partial<Config>,
  maybeConfigs?: Partial<Config>,
) {
  let name: string | undefined
  let configs: Partial<Config> | undefined

  if (typeof nameOrConfigs === 'string') {
    name = nameOrConfigs
    configs = maybeConfigs
  }
  else {
    name = 'default'
    configs = nameOrConfigs
  }

  return _useLogger(name, configs)
}

function _useLogger(name?: string, configs?: Partial<Config>) {
  // TODO - const { $loggerConfig } = tryUseNuxtApp()
  // default configs from module options
  const defaults: Partial<LoggerConfig> = {}

  // @ts-expect-error - useState is in app
  const configState = useState<ResolveReturnType | null>(`logger-config__${name ?? 'default'}`, () => null)
  configState.value = null

  if (!configState.value) {
    if (import.meta.client) {
      $fetch<ResolveReturnType>('/__logger-config', {
        method: 'GET',
        query: { name: name ?? 'default' },
      }).then((config) => {
        configState.value = config
      })
    }
    else {
      resolveConfig(name ?? 'default').then((config) => {
        configState.value = config
      })
    }
  }

  async function send(level: LogLevel, message: string, data?: Record<string, any>) {
    const resolved = configState.value

    const config = mergeConfigs(resolved.env, resolved.json, configs ?? {}, resolved.runtime, defaults)

    const levelConfig = config.levels?.[level]

    const effectiveConfig = mergeConfigs(levelConfig || {}, config)
    if (!shouldLog(level, effectiveConfig.minLevel, effectiveConfig.maxLevel, effectiveConfig.allowedLevels)) return

    let payload = buildPayload({ level, message, data, meta: buildMeta() }, effectiveConfig)

    if (effectiveConfig.beforeSend) {
      const result = effectiveConfig.beforeSend(payload)
      if (result === false) return
      if (result) payload = result
    }

    payload = applyMask(payload, effectiveConfig.mask)

    if (effectiveConfig.formatter) {
      payload = effectiveConfig.formatter({ payload, config: effectiveConfig })
    }

    const outputs: OutputTarget[] = effectiveConfig.output ?? ['console']

    await Promise.all(
      outputs.map(async (t) => {
        const transport = transports[t]
        if (transport) await transport(payload, effectiveConfig)
      }),
    )

    if (effectiveConfig.afterSend) {
      effectiveConfig.afterSend(payload)
    }
  }

  function create(level: LogLevel) {
    return (message: string, data?: any) =>
      send(level, message, data)
  }

  function reset() {
    configState.value = null
  }

  return {
    name,
    send,
    create,
    reset,
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
