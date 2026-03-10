import fs from 'node:fs/promises'
import path from 'node:path'
import type { Config, LogPayload } from '../types'
import { resolveFilePath } from '../utils/resolveFilePath'

export async function fileTransport(
  payload: LogPayload,
  config: Config,
): Promise<void> {
  if (!import.meta.server) return
  if (!config.filePath) return

  try {
    const resolved = resolveFilePath(config.filePath, config.fileLogPeriod)
    const fullPath = path.resolve(process.cwd(), resolved)
    const line = JSON.stringify(payload) + '\n'

    await fs.mkdir(path.dirname(fullPath), { recursive: true })
    await fs.appendFile(fullPath, line)
  }
  catch (error) {
    console.error('[nuxt-log-utils] File transport error:', error)
  }
}
