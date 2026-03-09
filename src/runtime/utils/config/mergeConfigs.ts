import { LogLevel, type Config } from '../../types'
import { defu } from 'defu'

const DEFAULT_CONFIG: Config = {
  minLevel: LogLevel.INFO,
  maxLevel: undefined,
  allowedLevels: undefined,
  mask: undefined,
  includeMeta: true,
  levels: {},
}

/**
 *
 * @param configs - first has highest priority
 * @returns Config
 */
export function mergeConfigs(...configs: Partial<Config>[]): Config {
  const ARRAY_FIELDS = ['output', 'allowedLevels', 'criticalMeta'] as const

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
