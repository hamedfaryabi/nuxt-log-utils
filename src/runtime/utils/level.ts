import { LogLevel } from '../types'

export function normalizeLevel(level: number | string): LogLevel {
  if (typeof level === 'number') return level
  return LogLevel[level.toUpperCase() as keyof typeof LogLevel]
}

export function levelToString(level: number | string): string {
  return LogLevel[normalizeLevel(level)]
}

export function shouldLog(
  payloadLevel: LogLevel,
  minLevel?: LogLevel,
  maxLevel?: LogLevel,
  allowedLevels?: LogLevel[],
): boolean {
  if (allowedLevels !== undefined) {
    return allowedLevels.includes(payloadLevel)
  }
  if (minLevel !== undefined && payloadLevel < minLevel) return false
  if (maxLevel !== undefined && payloadLevel > maxLevel) return false
  return true
}
