import { defineEventHandler, readBody, getRouterParam } from 'h3'
import { resolveConfig } from '../../../utils/resolveConfig'
import { mergeConfigs } from '../../../utils/config/mergeConfigs'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const name = getRouterParam(event, 'name')

  if (!name || typeof name !== 'string') {
    return { error: 'Invalid logger name' }
  }

  if (!body || typeof body !== 'object') {
    return { error: 'Invalid payload' }
  }

  const size = Buffer.byteLength(JSON.stringify(body))
  if (size > 1024 * 1024) {
    return { error: 'Payload too large' }
  }

  const loggerConfig = await resolveConfig(name)

  const config = mergeConfigs(loggerConfig.env, loggerConfig.json, loggerConfig.runtime)

  const url = config.apiUrl
  if (!url) {
    return { error: 'No API URL configured' }
  }

  try {
    await $fetch(url, {
      method: 'POST',
      body,
    })
  }
  catch (error) {
    console.error('[nuxt-log] API transport error:', error)
  }

  return { ok: true }
})
