<template>
  <div>
    <h2>Log Level Filtering</h2>
    <p>Tests minLevel, maxLevel, and allowedLevels behavior. Check the console.</p>

    <div style="display: flex; flex-direction: column; gap: 0.5rem; max-width: 500px;">
      <button @click="testMinLevel">
        🔽 minLevel = ERROR (debug/info/warning should be skipped)
      </button>
      <button @click="testMaxLevel">
        🔼 maxLevel = WARNING (error/critical should be skipped)
      </button>
      <button @click="testAllowedLevels">
        🎯 allowedLevels = [DEBUG, CRITICAL] (only those two)
      </button>
      <button @click="testRange">
        📏 minLevel=INFO, maxLevel=WARNING (only INFO, NOTICE, WARNING)
      </button>
      <button @click="testRangeWithAllowed">
        📏 minLevel=INFO, maxLevel=WARNING, allowedLevels = [NOTICE, ERROR]  (only NOTICE)
      </button>
      <button @click="testCustomLevel">
        🛠️ create() custom level shortcut
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
import { LogLevel } from '../../src/runtime/types'

const results = ref<string[]>([])

function testMinLevel() {
  const logger = useLogger({
    minLevel: LogLevel.ERROR
  })

  results.value = ['Testing minLevel = ERROR (400)...']
  logger.debug('Should be SKIPPED (debug < error)')
  logger.info('Should be SKIPPED (info < error)')
  logger.warning('Should be SKIPPED (warning < error)')
  logger.error('Should APPEAR (error = error)')
  logger.critical('Should APPEAR (critical > error)')
  results.value.push('Sent debug, info, warning, error, critical — only error+ should appear')
}

function testMaxLevel() {
  const logger = useLogger({
    maxLevel: LogLevel.WARNING
  })

  results.value = ['Testing maxLevel = WARNING (300)...']
  logger.debug('Should APPEAR (debug < warning)')
  logger.info('Should APPEAR (info < warning)')
  logger.warning('Should APPEAR (warning = warning)')
  logger.error('Should be SKIPPED (error > warning)')
  logger.critical('Should be SKIPPED (critical > warning)')
  results.value.push('Sent debug, info, warning, error, critical — only up to warning should appear')
}

function testAllowedLevels() {
  const logger = useLogger({
    allowedLevels: [LogLevel.DEBUG, LogLevel.CRITICAL]
  })
  results.value = ['Testing allowedLevels = [DEBUG, CRITICAL]...']
  logger.debug('Should APPEAR (in allowedLevels)')
  logger.info('Should be SKIPPED (not in allowedLevels)')
  logger.warning('Should be SKIPPED (not in allowedLevels)')
  logger.critical('Should APPEAR (in allowedLevels)')
  results.value.push('Sent debug, info, warning, critical — only debug and critical should appear')
}

function testRange() {
  const logger = useLogger({
    minLevel: LogLevel.DEBUG,
    maxLevel: LogLevel.WARNING
  })

  results.value = ['Testing minLevel=INFO, maxLevel=WARNING...']
  logger.debug('Should be SKIPPED (below INFO)')
  logger.info('Should APPEAR (= minLevel)')
  logger.notice('Should APPEAR (between min and max)')
  logger.warning('Should APPEAR (= maxLevel)')
  logger.error('Should be SKIPPED (above WARNING)')
  results.value.push('Sent debug through error — only info, notice, warning should appear')
}
function testRangeWithAllowed() {
  const logger = useLogger({
    minLevel: LogLevel.INFO,
    maxLevel: LogLevel.WARNING,
    allowedLevels: [LogLevel.NOTICE, LogLevel.ERROR]
  })

  results.value = ['Testing minLevel=INFO, maxLevel=WARNING, allowedLevels=[NOTICE, ERROR]...']
  logger.debug('Should be SKIPPED (below INFO)')
  logger.info('Should be SKIPPED (not in allowedLevels)')
  logger.notice('Should APPEAR (between min and max and in allowedLevels)')
  logger.warning('Should be SKIPPED (not in allowedLevels)')
  logger.error('Should be SKIPPED (above WARNING)')
  results.value.push('Sent debug through error — only info, notice, warning should appear')
}

function testCustomLevel() {
  const logger = useLogger()

  results.value = ['Testing create() custom level shortcut...']
  const logAlert = logger.create(LogLevel.ALERT)
  logAlert('Custom ALERT via create()', { custom: true })
  results.value.push('Sent ALERT via logger.create(LogLevel.ALERT)')
}
</script>
