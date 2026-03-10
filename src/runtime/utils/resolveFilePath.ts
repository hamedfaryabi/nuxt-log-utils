import type { FileLogPeriod } from '../types'

/**
 * Resolves the actual log file path based on the configured period.
 *
 * Examples (base: logs/app.log):
 * @example  daily   → logs/app-2026-02-19.log
 * @example  monthly → logs/app-2026-02.log
 * @example  yearly  → logs/app-2026.log
 * @example  undefined → logs/app.log (unchanged)
 */
export function resolveFilePath(
  filePath: string,
  period?: FileLogPeriod,
): string {
  if (!period) return filePath

  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  let suffix: string
  if (period === 'daily') suffix = `${year}-${month}-${day}`
  else if (period === 'monthly') suffix = `${year}-${month}`
  else suffix = `${year}`

  // Insert suffix before the file extension
  // logs/app.log → logs/app-2026-02-19.log
  const dotIndex = filePath.lastIndexOf('.')
  if (dotIndex === -1) return `${filePath}-${suffix}`

  return filePath.slice(0, dotIndex) + `-${suffix}` + filePath.slice(dotIndex)
}
