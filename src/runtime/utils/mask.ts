function defaultMask(value: string | number): string {
  const str = String(value)
  if (str.length <= 4) return '****'
  return str.slice(0, 2) + '****' + str.slice(-2)
}

export function applyMask(
  obj: any,
  mask: string[] | Record<string, any> | undefined, // allow nested objects
): any {
  if (!obj || typeof obj !== 'object') return obj
  if (!mask) return obj

  const isArrayMask = Array.isArray(mask)
  const keys = isArrayMask ? mask : Object.keys(mask)

  const result: any = Array.isArray(obj) ? [...obj] : { ...obj }

  for (const key of Object.keys(result)) {
    if (keys.includes(key)) {
      if (isArrayMask) {
        // Array mode: always apply default mask
        result[key] = defaultMask(String(result[key]))
      }
      else {
        const customizer = (mask as Record<string, any>)[key]

        if (customizer === false) {
          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
          delete result[key]
        }
        else if (customizer === true) {
          result[key] = defaultMask(String(result[key]))
        }
        else if (typeof customizer === 'function') {
          result[key] = customizer(String(result[key]))
        }
        else if (typeof customizer === 'object' && customizer !== null) {
          // Recurse with nested mask
          result[key] = applyMask(result[key], customizer)
        }
        else {
          // Default mask
          result[key] = defaultMask(String(result[key]))
        }
      }
    }
    else if (result[key] && typeof result[key] === 'object') {
      // If the key isn't in the mask, still recurse for nested objects
      result[key] = applyMask(result[key], mask)
    }
  }

  return result
}
