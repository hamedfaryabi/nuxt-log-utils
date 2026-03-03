import { defu } from 'defu'
import type { Config, LogPayload } from '../types'
import { levelToString, normalizeLevel } from './level'

export function buildPayload(
  input: LogPayload,
  config: Config,
): LogPayload {
  return {
    level: normalizeLevel(input.level),
    message: `[${levelToString(input.level)}] ` + input.message,
    data: input.data,
    meta: config.includeMeta === false
      ? input.meta
      : defu(input.meta, config.meta),
  }
}
