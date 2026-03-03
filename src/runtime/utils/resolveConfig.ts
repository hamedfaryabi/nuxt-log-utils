import { defu } from 'defu'
import type { Config, LoggerConfig } from '../types'
import { LogLevel } from '../types'
import { resolveEnvConfig } from './resolveEnvConfig'

const DEFAULT_CONFIG: Config = {
  minLevel: LogLevel.INFO,
  maxLevel: undefined,
  allowedLevels: undefined,
  mask: undefined,
  levels: {},
}

function mergeConfigs(...configs: Partial<Config>[]): Config {
  const ARRAY_FIELDS = ['output', 'allowedLevels'] as const

  let result = { ...DEFAULT_CONFIG }

  const reversed = [...configs].reverse()
  for (const config of reversed) {
    result = defu(config, result) as Config
  }

  for (const field of ARRAY_FIELDS) {
    for (const config of configs) {
      if (
        config
        && field in config
        && Array.isArray(config[field as keyof typeof config])
      ) {
        (result as Record<string, unknown>)[field]
          = config[field as keyof typeof config]
        break
      }
    }
  }

  return result
}

export function resolveConfig(
  instanceConfig: Partial<Config>,
  globalConfigs: LoggerConfig,
  loggerName: string,
  levelName?: LogLevel,
): Config {
  console.log('resolving config for name "', loggerName, '" and level "', levelName, '"')
  console.log('global configs:', globalConfigs)
  // config from env
  const envConfig: Partial<Config> = loggerName
    ? resolveEnvConfig(loggerName)
    : {}
    console.log('env config: ', envConfig)

    // config from module config in `nuxt.config.ts`
    const moduleConfig: Partial<Config> = globalConfigs[loggerName] ?? {}
    console.log('module config: ', moduleConfig)

  let effective = mergeConfigs(
    envConfig,
    instanceConfig,
    moduleConfig,
  )

  if (levelName && effective.levels?.[levelName]) {
    const levelOverride = effective.levels[levelName] as Partial<Config>
    effective = mergeConfigs(levelOverride, effective)
  }
  console.log('effective config:', effective)
  return effective
}
