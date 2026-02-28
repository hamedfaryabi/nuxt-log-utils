import type { LoggerConfig } from '../types'

type EnvConfig = Partial<LoggerConfig>

const ARRAY_KEYS = ['output', 'allowedLevels'] as const

function parseValue(key: string, raw: string): unknown {
  if ((ARRAY_KEYS as readonly string[]).includes(key)) {
    return raw.split(',').map(v => v.trim()).filter(Boolean)
  }
  if (raw === 'true') return true
  if (raw === 'false') return false
  if (!isNaN(Number(raw)) && raw !== '') return Number(raw)
  return raw
}

/**
 * Reads NUXT_PUBLIC_LOGGER_{NAME}_{KEY} env vars and returns a partial config.
 * Works in both server (process.env) and client (import.meta.env) contexts.
 */
export function resolveEnvConfig(name?: string): EnvConfig {
  const loggerName = name ?? "default";
  const prefix = `NUXT_PUBLIC_LOGGER_${loggerName.toUpperCase()}_`
  const result: Record<string, unknown> = {}

  // Server-side: process.env
  if (typeof process !== 'undefined' && process.env) {
    for (const [key, value] of Object.entries(process.env)) {
      if (!key.startsWith(prefix) || value === undefined) continue
      const configKey = key.slice(prefix.length).toLowerCase()
      result[configKey] = parseValue(configKey, value)
    }
  }

  // Client-side: import.meta.env (Vite/Nuxt injects NUXT_PUBLIC_* at build for client)
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const env = (import.meta as any).env as Record<string, string>
    for (const [key, value] of Object.entries(env)) {
      if (!key.startsWith(prefix) || typeof value !== 'string') continue
      const configKey = key.slice(prefix.length).toLowerCase()
      result[configKey] = parseValue(configKey, value)
    }
  }

  return result as EnvConfig
}
