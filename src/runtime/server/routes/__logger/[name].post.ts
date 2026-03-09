import { defineEventHandler, readBody, getRouterParam, createError } from 'h3'
import { resolveConfig } from '../../../utils/resolveConfig'
import { mergeConfigs } from '../../../utils/config/mergeConfigs'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const name = getRouterParam(event, 'name')

  if (!name || typeof name !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid logger name' })
  }

  if (!body || typeof body !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid payload' })
  }

  const size = Buffer.byteLength(JSON.stringify(body))
  if (size > 1024 * 1024) {
    throw createError({ statusCode: 413, statusMessage: 'Payload too large' })
  }

  const loggerConfig = await resolveConfig(name)

  const config = mergeConfigs(loggerConfig.env, loggerConfig.json, loggerConfig.runtime)

  const url = config.apiUrl
  if (!url) {
    throw createError({ statusCode: 500, statusMessage: 'No API URL configured' })
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
