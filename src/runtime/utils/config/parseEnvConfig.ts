// Utility for parsing environment variables into a nested config object.
//
// Env vars expected format (for logger `myLogger`):

//   LOGGER_MY-LOGGER_MIN-LEVEL=info
//   LOGGER_MY-LOGGER_OUTPUT=console,file
//     - `output` becomes an array of `OutputTarget` (`console`, `file`, `api`).
//   LOGGER_MY-LOGGER_APIURL=https://example.com
//     - sets `apiUrl` for API transport
//   LOGGER_MY-LOGGER_FILEPATH=/var/log/my.log
//     - sets `filePath` for file transport
//   LOGGER_MY-LOGGER_FILELOGPERIOD=daily
//     - sets `fileLogPeriod` (one of `daily` | `monthly` | `yearly`)
//   LOGGER_MY-LOGGER_MASK=email,ip
//     - comma-separated values become an array for `mask`
//   LOGGER_MY-LOGGER_LEVELS__ERROR__MIN-LEVEL=400
//     - per-level override: `levels.error.minLevel` (use `__` to nest)
//
// Notes:
// - The prefix is `LOGGER_<LOGGER_NAME>_` (logger name uppercased).
// - Double underscores (`__`) indicate nesting levels and are converted to
//   nested object keys (the parser lowercases path segments).
// - `parseValue` converts `true`/`false` to booleans, numeric-looking strings
//   to numbers, and comma-separated strings to arrays. Other strings remain
//   as-is, keeping environment-driven config simple and predictable.

type EnvConfig = Record<string, any>

/**
 * Set a value deeply on an object given a path of keys.
 *
 * This mutates `obj`. Path parts are expected to be strings already
 * normalized (e.g. lowercased by the caller).
 */
function setDeep(obj: any, path: string[], value: any) {
  let current = obj
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i] as string
    if (!current[key]) current[key] = {}
    current = current[key]
  }
  const idx = path[path.length - 1] as string
  current[idx] = value
}

/**
 * Parse a raw environment variable string into a JS value.
 *
 * Behavior:
 * - 'true' / 'false' -> boolean
 * - numeric strings -> number (NaN-safe via Number())
 * - comma-separated -> array of trimmed strings
 * - otherwise -> original string
 */
function parseValue(val: string): any {
  if (val === 'true') return true
  if (val === 'false') return false
  if (!Number.isNaN(Number(val))) return Number(val)
  if (val.includes(',')) return val.split(',').map(v => v.trim())
  return val
}

/**
 * Read process.env and build a namespaced config object for a logger.
 *
 * Example: calling `parseEnvConfig('app')` will scan for keys starting with
 * `LOGGER_APP_` and convert them into a nested object using `__` as a
 * separator. Keys are lowercased to produce predictable object keys.
 */
export function parseEnvConfig(loggerName: string): EnvConfig {
  const result: EnvConfig = {}

  // In environments without `process` (e.g. some browser bundles during
  // build-time), bail out with an empty config.
  if (typeof process === 'undefined') return result

  // Normalize logger name so that different naming styles map to the
  // same env prefix. Examples that should resolve to the same prefix:
  //   myLogger, my_logger, my-logger -> LOGGER_MY-LOGGER_
  function normalizeLoggerName(name: string) {
    // replace underscores with hyphens, convert camelCase boundaries to
    // hyphens (e.g. myLogger -> my-logger), then uppercase for prefix.
    const withHyphens = name.replace(/_/g, '-').replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    return withHyphens.toUpperCase()
  }

  const prefix = `LOGGER_${normalizeLoggerName(loggerName)}_`

  for (const key in process.env) {
    if (!key.startsWith(prefix)) continue

    // Remove the prefix and split on double underscore to derive nesting.
    const rawPath = key.replace(prefix, '')

    // Convert each path segment to a predictable object key.
    // - Lowercase the segment
    // - Convert hyphen-separated names to camelCase so that env like
    //   `MIN-LEVEL` becomes `minLevel` in the resulting object.
    function normalizePathPart(part: string) {
      const lower = part.toLowerCase()
      if (lower.includes('-')) {
        return lower.split('-').map((seg, i) => i === 0 ? seg : seg.charAt(0).toUpperCase() + seg.slice(1)).join('')
      }
      return lower
    }

    const pathParts = rawPath.split('__').map(p => normalizePathPart(p))

    const value = parseValue(process.env[key] as string)
    setDeep(result, pathParts, value)
  }

  return result
}
