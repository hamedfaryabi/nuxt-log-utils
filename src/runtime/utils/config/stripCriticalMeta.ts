/* eslint-disable @typescript-eslint/no-dynamic-delete */
// Supports dot notation deep removal

function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) return obj.map(deepClone) as T
  const result: any = {}
  for (const key of Object.keys(obj as any)) {
    result[key] = deepClone((obj as any)[key])
  }
  return result
}

function deleteDeep(obj: any, path: string[]) {
  if (!obj) return

  const key = path[0] as string

  if (path.length === 1) {
    delete obj[key]
    return
  }

  deleteDeep(obj[key], path.slice(1))
}

export function stripCriticalMeta(
  meta: Record<string, any>,
  critical: string[] = [],
) {
  const clone = deepClone(meta)

  for (const path of critical) {
    deleteDeep(clone, path.split('.'))
  }

  return clone
}
