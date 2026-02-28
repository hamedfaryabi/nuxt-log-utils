<template>
  <div>
    <h2>Named Loggers</h2>
    <p>Tests scoped loggers with independent configuration. Check the console.</p>

    <div style="display: flex; flex-direction: column; gap: 0.5rem; max-width: 500px;">
      <button @click="testDefaultLogger">
        📝 Default Logger (no name)
      </button>
      <button @click="testAuthLogger">
        🔐 Auth Logger — masks password &amp; token
      </button>
      <button @click="testPaymentLogger">
        💳 Payment Logger — file output, custom card mask
      </button>
      <button @click="testCustomLogger">
        🏷️ Custom Named Logger
      </button>
      <button @click="testAllLoggers">
        🔁 All Loggers Side by Side
      </button>
    </div>

    <div v-if="results.length" style="margin-top: 1rem; padding: 1rem; background: #f0f0f0; border-radius: 8px;">
      <strong>Results:</strong>
      <ul>
        <li v-for="(r, i) in results" :key="i">{{ r }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
const results = ref<string[]>([])

function testDefaultLogger() {
  const logger = useLogger()
  results.value = ['Testing default logger (no name)...']
  logger.info('Default logger message', { page: 'named' })
  results.value.push(`Logger name: "${logger.name ?? '(none)'}" — uses global config`)
}

function testAuthLogger() {
  const authLogger = useLogger('auth')
  results.value = ['Testing auth logger...']
  authLogger.debug('Auth debug — should appear (minLevel=DEBUG for auth)', {
    username: 'alice',
    password: 'secret123',
    token: 'jwt-abc-xyz',
  })
  results.value.push(`Logger name: "${authLogger.name}" — minLevel=DEBUG, masks password & token`)
}

function testPaymentLogger() {
  const paymentLogger = useLogger('payment')
  results.value = ['Testing payment logger...']
  paymentLogger.info('Payment processed', {
    orderId: 'ORD-99',
    cardNumber: '4111111111111234',
    cvv: '456',
    amount: 250.00,
  })
  results.value.push(`Logger name: "${paymentLogger.name}" — output: console+file, custom card mask, cvv removed`)
}

function testCustomLogger() {
  const customLogger = useLogger('analytics')
  results.value = ['Testing custom named logger (analytics)...']
  customLogger.info('Page view tracked', {
    page: '/named',
    duration: 1234,
    userId: 42,
  })
  results.value.push(`Logger name: "${customLogger.name}" — no special config, inherits global`)
}

function testAllLoggers() {
  results.value = ['Testing all loggers side by side...']

  const defaultLogger = useLogger()
  const authLogger = useLogger('auth')
  const paymentLogger = useLogger('payment')

  defaultLogger.info('Default: general info')
  authLogger.info('Auth: login event', { password: 'secret', token: 'abc' })
  paymentLogger.info('Payment: charge', { cardNumber: '4111111111111234', cvv: '123' })

  results.value.push('Sent from default, auth, and payment loggers — compare console output')
}
</script>
