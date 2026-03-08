// Utility for parsing environment variables into a nested config object.
//
// Env vars expected format (for logger `myLogger`):
//
//   LOGGER_MY_LOGGER_MIN_LEVEL=info
//   LOGGER_MY_LOGGER_OUTPUT=console,file
//     - `output` becomes an array of `OutputTarget` (`console`, `file`, `api`).
//   LOGGER_MY_LOGGER_API_URL=https://example.com
//     - sets `apiUrl` for API transport
//   LOGGER_MY_LOGGER_FILE_PATH=/var/log/my.log
//     - sets `filePath` for file transport
//   LOGGER_MY_LOGGER_FILE_LOG_PERIOD=daily
//     - sets `fileLogPeriod` (one of `daily` | `monthly` | `yearly`)
//   LOGGER_MY_LOGGER_MASK=email,ip
//     - comma-separated values become an array for `mask`
//   LOGGER_MY_LOGGER_LEVELS__ERROR__MIN_LEVEL=400
//     - per-level override: `levels.error.minLevel`
//
// Notes:
// - Prefix format: LOGGER_<LOGGER_NAME>_
// - Logger names normalize to uppercase snake case.
// - Double underscore (`__`) indicates nested object levels.
// - Single underscores are converted to camelCase in the resulting config.
//

type EnvConfig = Record<string, any>

/**
 * Safely sets a deeply nested value on an object.
 */
function setDeep(obj: any, path: string[], value: any) {
  let current = obj

  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i] as string

    if (typeof current[key] !== 'object' || current[key] === null) {
      current[key] = {}
    }

    current = current[key]
  }

  current[path[path.length - 1] as string] = value
}

/**
 * Convert ENV string value into a proper JS value.
 */
function parseValue(value: string): any {
  const val = value.trim()

  if (val === '') return ''

  if (val === 'true') return true
  if (val === 'false') return false

  // array
  if (val.includes(',')) {
    return val.split(',').map(v => v.trim())
  }

  // number (only if it does not start with 0)
  // eslint-disable-next-line regexp/no-unused-capturing-group
  if (/^-?[1-9]\d*(\.\d+)?$/.test(val) || val === '0') {
    return Number(val)
  }

  return val
}

/**
 * Convert ENV key segment to camelCase.
 *
 * MIN_LEVEL -> minLevel
 * FILE_LOG_PERIOD -> fileLogPeriod
 */
function normalizePathPart(part: string): string {
  const segments = part.toLowerCase().split('_')

  return segments
    .map((seg, i) =>
      i === 0 ? seg : seg.charAt(0).toUpperCase() + seg.slice(1),
    )
    .join('')
}

/**
 * Normalize logger name to ENV-safe format.
 *
 * myLogger  -> MY_LOGGER
 * my-logger -> MY_LOGGER
 * my_logger -> MY_LOGGER
 */
function normalizeLoggerName(name: string): string {
  return name
    .replace(/-/g, '_')
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .toUpperCase()
}

/**
 * Parse environment variables into a nested config object.
 */
export function parseEnvConfig(loggerName: string): EnvConfig {
  const result: EnvConfig = {}

  if (typeof process === 'undefined' || !process.env) {
    return result
  }

  const prefix = `LOGGER_${normalizeLoggerName(loggerName)}_`

  for (const key in process.env) {
    if (!key.startsWith(prefix)) continue

    const rawPath = key.slice(prefix.length)

    const path = rawPath
      .split('__')
      .map(normalizePathPart)

    const rawValue = process.env[key]

    if (rawValue === undefined) continue

    const value = parseValue(rawValue)

    setDeep(result, path, value)
  }

  return result
}
