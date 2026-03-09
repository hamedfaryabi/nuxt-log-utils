import { consola } from 'consola'
import { LogLevel, type Config, type LogPayload } from '../types'

const levelMap: Record<LogLevel, number> = {
  [LogLevel.DEBUG]: 3,
  [LogLevel.INFO]: 3,
  [LogLevel.NOTICE]: 3,
  [LogLevel.WARNING]: 1,
  [LogLevel.ERROR]: 0,
  [LogLevel.CRITICAL]: 0,
  [LogLevel.ALERT]: 1,
  [LogLevel.EMERGENCY]: 0,
}

export async function consoleTransport(
  payload: LogPayload,
  _config: Config,
): Promise<void> {
  const numericLevel
    = typeof payload.level === 'number' ? payload.level : LogLevel.INFO
  const consolaLevel = levelMap[numericLevel as LogLevel] ?? 3

  const args: Record<string, any> = {}

  if (_config.includeMeta && payload.meta) {
    args['meta'] = payload.meta
  }

  if (payload.data && Object.keys(payload.data).length > 0) {
    args['data'] = payload.data
  }

  try {
    consola.log(
      {
        level: consolaLevel,
        message: payload.message,
        ...(Object.keys(args).length > 0 && { args: [args] }),
      },
    )
  }
  catch (error) {
    console.error('[nuxt-log] Console transport error:', error)
  }
}
