import { defu } from 'defu'
import type { LoggerConfig } from '../types'
import { LogLevel } from '../types'

export function resolveConfig(config: LoggerConfig, level: LogLevel): LoggerConfig {
  const levelKey = LogLevel[level] as keyof typeof LogLevel
  const override = config.levels?.[levelKey]
  if (!override) return config

  const merged = defu({}, override, config) as LoggerConfig

  // defu appends arrays — force-replace array fields when override specifies them
  if (override.output !== undefined) {
    merged.output = override.output
  }
  if (override.allowedLevels !== undefined) {
    merged.allowedLevels = override.allowedLevels
  }

  return merged
}
