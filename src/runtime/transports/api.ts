import type { Config, LogPayload } from '../types'

export async function apiTransport(
  payload: LogPayload,
  config: Config,
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
