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
import { ref } from 'vue'
import defu from 'defu'

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

function _useLogger(name?: string, loggerConfig?: Partial<Config>) {
  // default configs from module options
  // @ts-expect-error - useNuxtApp is in app
  const nuxtApp = useNuxtApp()
  const defaults: Partial<LoggerConfig> = nuxtApp?.$loggerConfig ?? {}

  const defaultConfigs = name ? defaults[name] || {} : {}
  const configs = ref(defu(loggerConfig, {}))

  const cacheKey = `logger-config__${name ?? 'default'}`

  // @ts-expect-error - useState is in app
  const configState = useState<ResolveReturnType | null>(cacheKey, () => null)

  nuxtApp._loggerPromises = nuxtApp._loggerPromises || {}

  if (!configState.value && !nuxtApp._loggerPromises[cacheKey]) {
    if (import.meta.client) {
      nuxtApp._loggerPromises[cacheKey] = $fetch<ResolveReturnType>('/__logger-config', {
        method: 'GET',
        query: { name: name ?? 'default' },
      }).then((config) => {
        configState.value = config
        return config
      }).catch((error) => {
        console.error('[useLogger] Fetch error:', error)
        return null
      })
    }
    else {
      nuxtApp._loggerPromises[cacheKey] = resolveConfig(name ?? 'default').then((config) => {
        configState.value = config
        return config
      })
    }
  }

  async function send(level: LogLevel, message: string, data?: Record<string, any>) {
    if (!configState.value && nuxtApp._loggerPromises[cacheKey]) {
      await nuxtApp._loggerPromises[cacheKey]
    }

    const resolved = configState.value
    if (!resolved) {
      console.warn(`[useLogger] Could not load config for "${name ?? 'default'}". Log aborted.`)
      return
    }

    const config = mergeConfigs(resolved.env, resolved.json, configs.value ?? {}, resolved.runtime, defaultConfigs)
    const levelConfig = config.levels?.[level]

    const effectiveConfig = mergeConfigs(levelConfig || {}, config)
    if (effectiveConfig.enabled === false) return
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
