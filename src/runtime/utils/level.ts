import { LogLevel } from '../types'

export function normalizeLevel(level: LogLevel | string): LogLevel {
  if (typeof level === 'number') return level as LogLevel
  const resolved = LogLevel[level.toUpperCase() as keyof typeof LogLevel]
  if (resolved === undefined) {
    throw new Error(`[nuxt-log] Unknown log level: "${level}"`)
  }
  return resolved
}

export function levelToString(level: number | string): string {
  if (typeof level === 'string') return level.toUpperCase()
  const name = LogLevel[level]
  return name ?? String(level)
}

export function shouldLog(
  payloadLevel: LogLevel,
  minLevel?: LogLevel,
  maxLevel?: LogLevel,
  allowedLevels?: LogLevel[],
): boolean {
  if (minLevel !== undefined && payloadLevel < minLevel) return false
  if (maxLevel !== undefined && payloadLevel > maxLevel) return false
  
  if (allowedLevels !== undefined) {
    return allowedLevels.includes(payloadLevel)
  }
  return true
}
