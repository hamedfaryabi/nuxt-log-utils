import type { LogPayload } from '../types'

export async function apiTransport(
  payload: LogPayload,
  apiUrl: string,
) {
  await $fetch(apiUrl, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
