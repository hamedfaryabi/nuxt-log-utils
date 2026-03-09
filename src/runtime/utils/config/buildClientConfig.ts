/**
 * Strips server-only fields (filePath, fileLogPeriod, criticalMeta) from resolved
 * configs and rewrites apiUrl to the internal proxy route for client-side use.
 */
import type { ResolveReturnType } from '../resolveConfig'
import { stripCriticalMeta } from './stripCriticalMeta'

export function buildClientConfig(serverConfigs: ResolveReturnType) {
  const clone: Record<string, any> = {}
  for (const [key, value] of Object.entries(serverConfigs)) {
    if (value && typeof value === 'object') {
      clone[key] = { ...value }
    }
    else {
      clone[key] = value
    }
  }
  for (const conf of Object.values(clone)) {
    if (conf && typeof conf === 'object') {
      delete conf.fileLogPeriod
      delete conf.filePath

      if (conf.apiUrl)
        conf.apiUrl = '/__logger'

      const strippedMeta = stripCriticalMeta(conf.meta || {}, conf.criticalMeta ?? [])

      if (strippedMeta && Object.keys(strippedMeta).length > 0) {
        conf.meta = strippedMeta
      }
      else {
        delete conf.meta
      }

      delete conf.criticalMeta
    }
  }
  return clone
}
