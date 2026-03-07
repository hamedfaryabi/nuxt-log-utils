import { defineEventHandler, getQuery } from 'h3'
import { buildClientConfig } from '../../utils/config/buildClientConfig'
import { resolveConfig } from '../../utils/resolveConfig'

export default defineEventHandler(async (event) => {
  const { name } = getQuery(event)

  if (name && typeof name === 'string') {
    const loggerConfig = await resolveConfig(name)

    return buildClientConfig(loggerConfig)
  }

  const serverConfig = await resolveConfig('default')
  return buildClientConfig(serverConfig)
})
