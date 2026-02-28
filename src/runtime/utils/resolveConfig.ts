import { defu } from 'defu'
import type { LoggerConfig } from '../types'
import { LogLevel } from '../types'
import { resolveEnvConfig } from './resolveEnvConfig'

const DEFAULT_CONFIG: LoggerConfig = {
  minLevel: LogLevel.INFO,
  maxLevel: undefined,
  allowedLevels: undefined,
  mask: undefined,
  levels: {},
}

function mergeConfigs(...configs: Partial<LoggerConfig>[]): LoggerConfig {
  const ARRAY_FIELDS = ['output', 'allowedLevels'] as const

  let result = { ...DEFAULT_CONFIG }

  const reversed = [...configs].reverse()
  for (const config of reversed) {
    result = defu(config, result) as LoggerConfig
  }

  for (const field of ARRAY_FIELDS) {
    for (const config of configs) {
      if (config && field in config && Array.isArray(config[field as keyof typeof config])) {
        ;(result as Record<string, unknown>)[field] = config[field as keyof typeof config]
        break
      }
    }
  }

  return result
}

export function resolveConfig(
  globalConfig: Partial<LoggerConfig>,
  loggerName: string | undefined,
  levelName?: LogLevel,
): LoggerConfig {
  const namedStaticConfig: Partial<LoggerConfig> =
    loggerName && globalConfig.loggers?.[loggerName]
      ? globalConfig.loggers[loggerName]
      : {}

  const envConfig: Partial<LoggerConfig> = loggerName
    ? resolveEnvConfig(loggerName)
    : {}

  let effective = mergeConfigs(envConfig, namedStaticConfig, globalConfig)

  if (levelName && effective.levels?.[levelName]) {
    const levelOverride = effective.levels[levelName] as Partial<LoggerConfig>
    effective = mergeConfigs(levelOverride, effective)
  }

  return effective
}
