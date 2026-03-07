<template>
  <div>
    <h2>Client-Side Logging</h2>
    <p>Open the browser console to see log output.</p>

    <div style="display: flex; flex-direction: column; gap: 0.5rem; max-width: 400px;">
      <label for="include-meta">
        <input
          id="include-meta"
          v-model="includeMeta"
          type="checkbox"
        >
        Include meta
      </label>
    </div>

    <div style="display: flex; flex-direction: column; gap: 0.5rem; max-width: 400px; margin-top: 16px;">
      <button @click="logInfo">
        📗 Log INFO
      </button>
      <button @click="logWarning">
        📙 Log WARNING
      </button>
      <button @click="logError">
        📕 Log ERROR
      </button>
      <button @click="logWithData">
        📦 Log with Data
      </button>
      <button @click="logAllLevels">
        🔁 Log All Levels
      </button>
    </div>

    <div
      v-if="lastLog"
      style="margin-top: 1rem; padding: 1rem; background: #f5f5f5; border-radius: 8px;"
    >
      <strong>Last action:</strong> {{ lastLog }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'

const logger = ref()

const { $logger } = useNuxtApp()
const lastLog = ref('')
const includeMeta = ref<boolean>(true)

watch(includeMeta, (include: boolean) => {
  logger.value = useLogger({
    includeMeta: include,
  })
}, {
  immediate: true,
})

function logInfo() {
  logger.value.info('Hello from client')
  lastLog.value = 'Sent INFO via useLogger()'
}

function logWarning() {
  $logger.warning('Warning from plugin logger using $logger')
  lastLog.value = 'Sent WARNING via $logger plugin'
}

function logError() {
  logger.value.error('Something went wrong')
  lastLog.value = 'Sent ERROR (should also go to file transport on server)'
}

function logWithData() {
  logger.value.info('User action', {
    userId: 42,
    action: 'click',
    timestamp: new Date().toISOString(),
  })
  lastLog.value = 'Sent INFO with structured data'
}

function logAllLevels() {
  logger.value.debug('Debug message')
  logger.value.info('Info message')
  logger.value.notice('Notice message')
  logger.value.warning('Warning message')
  logger.value.error('Error message')
  logger.value.critical('Critical message')
  logger.value.alert('Alert message')
  logger.value.emergency('Emergency message')
  lastLog.value = 'Sent all 8 log levels'
}
</script>
