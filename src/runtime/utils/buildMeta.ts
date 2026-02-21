import type { LoggerMeta } from '../types'

/**
 * Builds default metadata
 */
export function buildMeta(): LoggerMeta {
  const meta: LoggerMeta = {
    timestamp: new Date().toISOString(),
    isServer: import.meta.server,
  }

  if (import.meta.client) {
    try {
      const route = useRoute()
      meta.path = route.fullPath
    } catch {
      // ignore
    }
  }

  return meta
}
