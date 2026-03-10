import type { LoggerMeta } from '../types'

/**
 * Builds default metadata (timestamp + server flag).
 */
export function buildMeta(): LoggerMeta {
  const meta: LoggerMeta = {
    timestamp: new Date().toISOString(),
    isServer: import.meta.server,
  }

  return meta
}
