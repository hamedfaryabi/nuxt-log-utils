import { consola } from 'consola'
import type { LogPayload } from '../types'

export async function consoleTransport(payload: LogPayload) {
  const level = typeof payload.level === 'number'
    ? payload.level
    : consola.level

  consola.log({
    level,
    message: payload.message,
    data: payload.data,
    meta: payload.meta,
  })
}
