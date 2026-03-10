<template>
  <div>
    <h2>Data Masking</h2>
    <p>Tests array-mode masking, object-mode masking, and recursive masking. Check the console.</p>

    <div style="display: flex; flex-direction: column; gap: 0.5rem; max-width: 500px;">
      <button @click="testArrayMask">
        🔒 Array Mask (mobile, email)
      </button>
      <button @click="testObjectMask">
        🔧 Object Mask (custom function + remove)
      </button>
      <button @click="testNestedMask">
        📂 Nested Object Masking
      </button>
      <button @click="testAuthLogger">
        🔐 Auth Logger (masks password &amp; token)
      </button>
      <button @click="testPaymentLogger">
        💳 Payment Logger (custom card mask, removes cvv)
      </button>
    </div>

    <div
      v-if="results.length"
      style="margin-top: 1rem; padding: 1rem; background: #f0f0f0; border-radius: 8px;"
    >
      <strong>Results:</strong>
      <ul>
        <li
          v-for="(r, i) in results"
          :key="i"
        >
          {{ r }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
const results = ref<string[]>([])

function testArrayMask() {
  const logger = useLogger({
    mask: ['mobile', 'email'],
    includeMeta: false,
  })
  results.value = ['Testing array-mode masking...']
  logger.info('User profile', {
    name: 'Alice',
    mobile: '09123456789',
    email: 'alice@example.com',
  })
  results.value.push('Sent log with mobile & email — check console for masked values (e.g. 09****89)')
}

function testObjectMask() {
  const logger = useLogger({
    mask: {
      access_token: false,
      mobile: (_m: string) => '*******',
    },
  })
  results.value = ['Testing object-mode masking...']
  logger.info('Credentials', {
    username: 'alice',
    mobile: '09123456789',
    access_token: 'super-secret-token-xyz',
  })
  results.value.push('Sent log — mobile should be custom-masked, access_token should be removed')
}

function testNestedMask() {
  const logger = useLogger({
    mask: {
      user: {
        contact: {
          mobile: (m: string) => m.slice(0, 4) + '****' + m.slice(-2),
          email: true,
        },
      },
    },
  })
  results.value = ['Testing nested object masking...']
  logger.info('Nested user data', {
    user: {
      name: 'Bob',
      contact: {
        mobile: '09123456789',
        email: 'bob@example.com',
      },
    },
  })
  results.value.push('Sent log with nested mobile & email — masking should apply recursively')
}

function testAuthLogger() {
  const authLogger = useLogger('auth')
  results.value = ['Testing auth logger masking (password & token)...']
  authLogger.info('Login attempt', {
    username: 'alice',
    password: 'super-secret-123',
    token: 'eyJhbGciOiJIUzI1NiJ9.long-jwt-token',
  })
  results.value.push('Sent via auth logger — password & token should be masked, username untouched')
}

function testPaymentLogger() {
  const paymentLogger = useLogger('payment')
  results.value = ['Testing payment logger masking (cardNumber custom, cvv removed)...']
  paymentLogger.info('Payment processed', {
    orderId: 'ORD-12345',
    cardNumber: '4111111111111234',
    cvv: '789',
    amount: 99.99,
  })
  results.value.push('Sent via payment logger — cardNumber: ****1234, cvv removed entirely')
}
</script>
