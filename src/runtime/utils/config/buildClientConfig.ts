/*
Remove:
  - filePath
  - fileLogPeriod
  - apiUrl (replace)
*/

import type { ResolveReturnType } from '../resolveConfig'
import { stripCriticalMeta } from './stripCriticalMeta'

export function buildClientConfig(serverConfigs: ResolveReturnType) {
  const clone = structuredClone(serverConfigs)
  for (const conf of Object.values(clone)) {
    if (conf && typeof conf === 'object') {
      delete conf.fileLogPeriod
      delete conf.filePath

      if (conf.apiUrl)
        conf.apiUrl = '/__logger'

      const stripedMeta = stripCriticalMeta(conf.meta || {}, conf.criticalMeta ?? [])

      if (stripedMeta && Object.keys(stripedMeta).length > 0) {
        conf.meta = stripedMeta
      }
      else {
        delete conf.meta
      }

      delete conf.criticalMeta
    }
  }
  return clone
}
