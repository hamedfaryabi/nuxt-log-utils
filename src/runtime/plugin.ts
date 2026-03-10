import { defineNuxtPlugin, useState, useNuxtApp } from '#app'
import { resolveConfig } from './utils/resolveConfig'
import type { ResolveReturnType } from './utils/resolveConfig'

export type LoggerConfigMap = Record<string, ResolveReturnType>

export default defineNuxtPlugin(async () => {
  const nuxtApp = useNuxtApp()
  const defaults = nuxtApp.$loggerConfig as Record<string, any> ?? {}
  const loggerNames = Object.keys(defaults)
  if (!loggerNames.includes('default')) {
    loggerNames.push('default')
  }

  const configMap = useState<LoggerConfigMap>('logger-config-map', () => ({}))

  if (import.meta.server) {
    const map: LoggerConfigMap = {}
    await Promise.all(
      loggerNames.map(async (name) => {
        map[name] = await resolveConfig(name)
      }),
    )
    configMap.value = map
  }
  else if (Object.keys(configMap.value).length === 0) {
    const serverMap = await $fetch<LoggerConfigMap>('/__logger-config')
    configMap.value = serverMap
  }
})
