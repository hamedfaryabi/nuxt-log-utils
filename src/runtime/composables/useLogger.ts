import type { Config, LoggerConfig } from '../types'
import { resolveConfig, type ResolveReturnType } from '../utils/resolveConfig'
import { createLoggerInstance, type LoggerInstance, type StateProvider } from '../utils/loggerCore'
import type { LoggerConfigMap } from '../plugin'
import { ref } from 'vue'
import defu from 'defu'

export function useLogger(name: string, configs?: Partial<Config>): LoggerInstance
export function useLogger(configs?: Partial<Config>): LoggerInstance

export function useLogger(
  nameOrConfigs?: string | Partial<Config>,
  maybeConfigs?: Partial<Config>,
): LoggerInstance {
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

function _useLogger(name?: string, loggerConfig?: Partial<Config>): LoggerInstance {
  const resolvedName = name ?? 'default'

  // @ts-expect-error - useNuxtApp is in app
  const nuxtApp = useNuxtApp()
  const defaults: Partial<LoggerConfig> = nuxtApp?.$loggerConfig ?? {}
  const defaultConfigs = name ? defaults[name] || {} : {}

  const localOverrides = ref(defu(loggerConfig, {}))

  // @ts-expect-error - useState is in app
  const configMap = useState<LoggerConfigMap>('logger-config-map', () => ({}))

  nuxtApp._loggerPromises = nuxtApp._loggerPromises || {}

  const stateProvider: StateProvider = {
    getResolved: () => configMap.value[resolvedName] ?? null,
    setResolved: (value) => {
      configMap.value = { ...configMap.value, [resolvedName]: value }
    },
    getPromise: () => nuxtApp._loggerPromises[resolvedName] ?? null,
    setPromise: (promise) => { nuxtApp._loggerPromises[resolvedName] = promise },
    getLocalOverrides: () => localOverrides.value ?? {},
    getDefaultConfigs: () => defaultConfigs,
  }

  if (!stateProvider.getResolved() && !stateProvider.getPromise()) {
    let loadPromise: Promise<ResolveReturnType | null>

    if (import.meta.client) {
      loadPromise = $fetch<ResolveReturnType>('/__logger-config', {
        method: 'GET',
        query: { name: resolvedName },
      }).then((config) => {
        stateProvider.setResolved(config)
        return config
      }).catch((error) => {
        console.error('[useLogger] Fetch error:', error)
        return null
      })
    }
    else {
      loadPromise = resolveConfig(resolvedName).then((config) => {
        stateProvider.setResolved(config)
        return config
      })
    }

    stateProvider.setPromise(loadPromise)
  }

  return createLoggerInstance(resolvedName, stateProvider)
}
