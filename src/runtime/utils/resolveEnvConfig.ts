import type { Config } from '../types'

type EnvConfig = Partial<Config>

const ARRAY_KEYS = ['output', 'allowedLevels'] as const

function parseValue(key: string, raw: unknown): unknown {
  if ((ARRAY_KEYS as readonly string[]).includes(key)) {
    if (Array.isArray(raw)) return raw
    return String(raw).split(',').map(v => v.trim()).filter(Boolean)
  }

  if (raw === 'true') return true
  if (raw === 'false') return false
  if (!Number.isNaN(Number(raw)) && raw !== '') return Number(raw)

  return raw
}

export function resolveEnvConfig(name?: string): EnvConfig {
  const loggerName = name ?? 'default'
  // @ts-expect-error - it is currect
  const config = useRuntimeConfig()
  console.log('runtime config:', config)

  const loggers = config.public.logger ?? config.logger ?? {}

  const loggerConfig = loggers[loggerName] || {}

  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(loggerConfig)) {
    result[key] = parseValue(key, value as unknown)
  }

  return result as EnvConfig
}
