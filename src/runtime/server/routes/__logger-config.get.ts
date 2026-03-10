import { defineEventHandler, getQuery } from 'h3'
import { buildClientConfig } from '../../utils/config/buildClientConfig'
import { resolveConfig } from '../../utils/resolveConfig'

export default defineEventHandler(async (event) => {
  const { name } = getQuery(event)

  // Single logger config
  if (name && typeof name === 'string') {
    const loggerConfig = await resolveConfig(name)
    const config = buildClientConfig(loggerConfig)
    return config
  }

  // Batch: resolve all known logger names
  // @ts-expect-error - useRuntimeConfig is auto-imported in Nitro
  const runtime = useRuntimeConfig()
  const runtimeLoggers = runtime.logger ?? {}
  const loggerNames = new Set<string>(Object.keys(runtimeLoggers))
  loggerNames.add('default')

  const result: Record<string, any> = {}
  await Promise.all(
    [...loggerNames].map(async (loggerName) => {
      const resolved = await resolveConfig(loggerName)
      result[loggerName] = buildClientConfig(resolved)
    }),
  )

  return result
})
