<template>
  <div>
    <h2>Client-Side Logging</h2>
    <p>Open the browser console to see log output.</p>

    <div style="display: flex; flex-direction: column; gap: 0.5rem; max-width: 400px;">
      <button @click="logInfo">📗 Log INFO</button>
      <button @click="logWarning">📙 Log WARNING</button>
      <button @click="logError">📕 Log ERROR</button>
      <button @click="logWithData">📦 Log with Data</button>
      <button @click="logAllLevels">🔁 Log All Levels</button>
    </div>

    <div v-if="lastLog" style="margin-top: 1rem; padding: 1rem; background: #f5f5f5; border-radius: 8px;">
      <strong>Last action:</strong> {{ lastLog }}
    </div>
  </div>
</template>

<script setup lang="ts">
const logger = useLogger()
const { $logger } = useNuxtApp()
const lastLog = ref('')

function logInfo() {
  logger.info('Hello from client', { page: 'index' })
  lastLog.value = 'Sent INFO via useLogger()'
}

function logWarning() {
  $logger.warning('Warning from plugin logger', { source: '$logger' })
  lastLog.value = 'Sent WARNING via $logger plugin'
}

function logError() {
  logger.error('Something went wrong', { code: 'ERR_TEST' })
  lastLog.value = 'Sent ERROR (should also go to file transport on server)'
}

function logWithData() {
  logger.info('User action', {
    userId: 42,
    action: 'click',
    timestamp: new Date().toISOString(),
  })
  lastLog.value = 'Sent INFO with structured data'
}

function logAllLevels() {
  logger.debug('Debug message')
  logger.info('Info message')
  logger.notice('Notice message')
  logger.warning('Warning message')
  logger.error('Error message')
  logger.critical('Critical message')
  logger.alert('Alert message')
  logger.emergency('Emergency message')
  lastLog.value = 'Sent all 8 log levels'
}
</script>
