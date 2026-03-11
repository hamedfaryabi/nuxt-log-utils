import type { Config, LoggerConfig } from '../../types'
import type { ResolveReturnType } from '../../utils/resolveConfig'
import { resolveConfig } from '../../utils/resolveConfig'
import { createLoggerInstance, type LoggerInstance, type StateProvider } from '../../utils/loggerCore'
import { defu } from 'defu'
import { useRuntimeConfig } from '#imports'

const configCache = new Map<string, ResolveReturnType>()
const promiseCache = new Map<string, Promise<ResolveReturnType | null>>()

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

  const resolvedName = name ?? 'default'
  const cacheKey = `logger-config__${resolvedName}`

  const runtime = useRuntimeConfig()
  const serializedDefaults: string = runtime.private.loggerModuleOptions ?? '{}'
  const defaults: LoggerConfig = eval('(' + serializedDefaults + ')')
  const defaultConfigs = defaults[resolvedName] || {}

  const localOverrides = defu(configs, {}) as Partial<Config>

  const stateProvider: StateProvider = {
    getResolved: () => configCache.get(cacheKey) ?? null,
    setResolved: (value) => { configCache.set(cacheKey, value) },
    getPromise: () => promiseCache.get(cacheKey) ?? null,
    setPromise: (promise) => { promiseCache.set(cacheKey, promise) },
    getLocalOverrides: () => localOverrides,
    getDefaultConfigs: () => defaultConfigs,
  }

  if (!stateProvider.getResolved() && !stateProvider.getPromise()) {
    const loadPromise = resolveConfig(resolvedName).then((config) => {
      stateProvider.setResolved(config)
      return config
    })

    stateProvider.setPromise(loadPromise)
  }

  return createLoggerInstance(resolvedName, stateProvider)
}
