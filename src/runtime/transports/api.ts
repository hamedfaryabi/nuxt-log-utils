import type { LoggerConfig, LogPayload } from '../types'

export async function apiTransport(
  payload: LogPayload,
  config: LoggerConfig,
): Promise<void> {
  if (!config.apiUrl) return

  try {
    await $fetch(config.apiUrl, {
      method: 'POST',
      body: payload,
    })
  }
  catch (error) {
    console.error('[nuxt-log] API transport error:', error)
  }
}
