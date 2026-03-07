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

      conf.apiUrl = '/__logger'

      const stripedMeta = stripCriticalMeta(conf.meta || {}, conf.criticalMeta ?? [])

      if (stripedMeta) {
        conf.meta = stripedMeta
      }

      delete conf.criticalMeta
    }
  }

  return clone
}
