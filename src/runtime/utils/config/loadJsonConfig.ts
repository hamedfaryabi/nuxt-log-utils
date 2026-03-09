let cached: Record<string, any> | null = null
export async function loadJsonConfig(): Promise<Record<string, any>> {
  if (import.meta.client) return {}
  if (cached) return cached
  // Detect Node.js runtime; if not running on Node, return empty config.
  if (typeof process === 'undefined' || !process.versions || !process.versions.node) {
    cached = {}
    return cached
  }
  try {
    const fs = await import('node:fs')
    const path = await import('node:path')

    const pathToLoad = path.resolve(process.cwd(), 'logger.config.json')
    if (!fs.existsSync(pathToLoad)) {
      cached = {}
      return cached
    }
    const raw = fs.readFileSync(pathToLoad, 'utf-8')
    cached = JSON.parse(raw)
  }
  catch (error) {
    console.error(error)
    cached = {}
  }
  return cached ?? {}
}
