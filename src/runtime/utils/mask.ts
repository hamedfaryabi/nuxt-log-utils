import type { MaskCustomizer } from '../types'

function defaultMask(value: string | number): string {
  const str = String(value)
  if (str.length <= 4) return '****'
  return str.slice(0, 2) + '****' + str.slice(-2)
}

export function applyMask(
  obj: any,
  mask: string[] | Record<string, MaskCustomizer> | undefined,
): any {
  if (!obj || typeof obj !== 'object') return obj
  if (!mask) return obj

  const isArray = Array.isArray(mask)
  const keys = isArray ? mask : Object.keys(mask)

  const result: any = Array.isArray(obj) ? [...obj] : { ...obj }

  for (const key of Object.keys(result)) {
    if (keys.includes(key)) {
      if (isArray) {
        // Array mode: always apply default mask
        result[key] = defaultMask(String(result[key]))
      } else {
        // Object mode
        const customizer = (mask as Record<string, MaskCustomizer>)[key]
        if (customizer === false) {
          // Remove the key entirely
          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
          delete result[key]
        } else if (typeof customizer === 'function') {
          result[key] = customizer(String(result[key]))
        } else {
          result[key] = defaultMask(String(result[key]))
        }
      }
    } else if (result[key] && typeof result[key] === 'object') {
      // Recurse into nested objects
      result[key] = applyMask(result[key], mask)
    }
  }

  return result
}
