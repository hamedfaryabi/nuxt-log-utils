<template>
  <div>
    <h2>Lifecycle Hooks</h2>
    <p>Tests beforeSend, afterSend, and formatter hooks. Check the console.</p>

    <div style="display: flex; flex-direction: column; gap: 0.5rem; max-width: 500px;">
      <button @click="testBeforeSendModify">
        ✏️ beforeSend — Modify payload
      </button>
      <button @click="testBeforeSendCancel">
        🚫 beforeSend — Cancel log (return false)
      </button>
      <button @click="testAfterSend">
        📬 afterSend — Side effect after log
      </button>
      <button @click="testFormatter">
        🎨 formatter — Custom payload transformation
      </button>
      <button @click="testAllHooks">
        🔗 All hooks combined
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

function testBeforeSendModify() {
  results.value = ['Testing beforeSend — modifying payload...']
  const logger = useLogger()
  logger.info('Original message', { source: 'hooks-page' })
  results.value.push('Check console — the beforeSend hook in nuxt.config can modify the payload before transport')
}

function testBeforeSendCancel() {
  results.value = ['Testing beforeSend — cancelling log...']
  const logger = useLogger()
  logger.info('This log might be cancelled if beforeSend returns false')
  results.value.push('If beforeSend returns false, nothing appears in console')
}

function testAfterSend() {
  results.value = ['Testing afterSend — side effects after logging...']
  const logger = useLogger()
  logger.info('Log with afterSend hook', { action: 'test' })
  results.value.push('afterSend fires after all transports complete — useful for metrics/analytics')
}

function testFormatter() {
  results.value = ['Testing formatter — custom payload transformation...']
  const logger = useLogger()
  logger.warning('Formatter test', { detail: 'custom format' })
  results.value.push('Formatter can reshape the payload before dispatch (e.g. uppercase message)')
}

function testAllHooks() {
  results.value = ['Testing all hooks combined...']
  const logger = useLogger()
  logger.error('Full hook chain', { chain: true })
  results.value.push('Order: beforeSend → mask → formatter → transport → afterSend')
}
</script>
