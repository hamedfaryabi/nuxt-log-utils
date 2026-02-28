export default defineEventHandler(async () => {
  const authLogger = useLogger('auth')

  await authLogger.info('Server auth event', {
    username: 'admin',
    password: 'super-secret-pass',
    token: 'eyJhbGciOiJIUzI1NiJ9.server-token',
    ip: '192.168.1.100',
  })

  return {
    ok: true,
    message: 'Logged auth event with masking on server. Check terminal — password & token should be masked.',
  }
})
