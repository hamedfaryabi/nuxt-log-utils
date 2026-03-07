// import { createResolver } from '@nuxt/kit'

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
    // Require Node built-ins at runtime to avoid bundler-time externalization.
    // Using `require` here keeps these imports out of the module graph for

    // client bundles.
    // const { existsSync, readFileSync } = require('node:fs')
    // const { resolve } = require('node:path')
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
