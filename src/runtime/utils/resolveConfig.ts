import type { Config } from '../types'
import { loadJsonConfig } from './config/loadJsonConfig'
import { parseEnvConfig } from './config/parseEnvConfig'
// import { loadJsonConfig } from '#imports'

export interface ResolveReturnType extends Record<string, Partial<Config>> {
  env: Partial<Config>
  json: Partial<Config>
  runtime: Partial<Config>
}
/**
 * resolve and merge configs and return a effective config
 * @param loggerName name of the logger
 * @returns Config
 */
export async function resolveConfig(
  loggerName: string,
): Promise<ResolveReturnType> {
  // @ts-expect-error - useRuntimeConfig is in app
  const runtime = useRuntimeConfig()

  const envConfig: Partial<Config> = import.meta.server ? parseEnvConfig(loggerName) : {}
  const jsonConfig: Partial<Config> = import.meta.server ? ((await loadJsonConfig())?.[loggerName] || {}) : {}
  const runtimeConfig: Partial<Config> = runtime.logger?.[loggerName] || {}

  return {
    env: envConfig,
    json: jsonConfig,
    runtime: runtimeConfig,
  }
}
