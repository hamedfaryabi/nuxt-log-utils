export default defineEventHandler(async () => {
  const logger = useLogger()

  await logger.error('Server error occurred', {
    code: 'ERR_SERVER_TEST',
    stack: 'Simulated error stack trace',
  })

  await logger.critical('Critical failure simulation', {
    service: 'payment-gateway',
    downtime: true,
  })

  return { ok: true, message: 'Logged error and critical on the server. Check terminal output and logs/ directory.' }
})
