import { defineEventHandler, getQuery } from 'h3'
import { buildClientConfig } from '../../utils/config/buildClientConfig'
import { resolveConfig } from '../../utils/resolveConfig'

export default defineEventHandler(async (event) => {
  const { name } = getQuery(event)

  if (name && typeof name === 'string') {
    const loggerConfig = await resolveConfig(name)
    const config = buildClientConfig(loggerConfig)
    return config
  }

  const serverConfig = await resolveConfig('default')
  const config = buildClientConfig(serverConfig)
  return config
})
