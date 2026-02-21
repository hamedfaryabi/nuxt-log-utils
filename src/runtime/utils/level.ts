import { LogLevel } from '../types'

export function normalizeLevel(level: number | string): LogLevel {
  if (typeof level === 'number') return level
  return LogLevel[level.toUpperCase() as keyof typeof LogLevel]
}

export function levelToString(level: number | string): string {
  return LogLevel[normalizeLevel(level)]
}

export function shouldLog(
  currentLevel: LogLevel,
  payloadLevel: LogLevel,
): boolean {
  return payloadLevel >= currentLevel
}
