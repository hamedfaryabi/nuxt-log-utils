/* eslint-disable @typescript-eslint/no-dynamic-delete */
// Supports dot notation deep removal

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
  const clone = { ...meta }

  for (const path of critical) {
    deleteDeep(clone, path.split('.'))
  }

  return clone
}
