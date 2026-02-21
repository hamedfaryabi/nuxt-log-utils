import fs from 'node:fs/promises'
import path from 'node:path'
import type { LogPayload } from '../types'

export async function fileTransport(
  payload: LogPayload,
  filePath: string,
) {
  if (!import.meta.server) return

  const fullPath = path.resolve(process.cwd(), filePath)
  const line = JSON.stringify(payload) + '\n'

  await fs.mkdir(path.dirname(fullPath), { recursive: true })
  await fs.appendFile(fullPath, line)
}
