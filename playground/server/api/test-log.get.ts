export default defineEventHandler(async () => {
  const logger = useLogger()

  await logger.info('Server-side info log', {
    source: 'api-route',
    timestamp: new Date().toISOString(),
  })

  await logger.debug('Server debug message', { detail: 'verbose' })

  return { ok: true, message: 'Logged info and debug on the server. Check terminal output.' }
})
