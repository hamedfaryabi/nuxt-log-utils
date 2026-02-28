<template>
  <div>
    <h2>Server-Side Logging</h2>
    <p>Tests logging from server API routes. Check the terminal/server console for output.</p>

    <div style="display: flex; flex-direction: column; gap: 0.5rem; max-width: 500px;">
      <button @click="testServerLog">
        🖥️ Trigger Server Log
      </button>
      <button @click="testServerError">
        💥 Trigger Server Error Log
      </button>
      <button @click="testServerMasking">
        🔒 Trigger Server Masking
      </button>
    </div>

    <div v-if="loading" style="margin-top: 1rem; color: #666;">
      Loading...
    </div>

    <div v-if="response" style="margin-top: 1rem; padding: 1rem; background: #f0f0f0; border-radius: 8px;">
      <strong>Server Response:</strong>
      <pre style="white-space: pre-wrap; word-break: break-all;">{{ JSON.stringify(response, null, 2) }}</pre>
    </div>

    <div v-if="error" style="margin-top: 1rem; padding: 1rem; background: #ffe0e0; border-radius: 8px;">
      <strong>Error:</strong> {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
const loading = ref(false)
const response = ref<any>(null)
const error = ref<string | null>(null)

async function fetchRoute(path: string) {
  loading.value = true
  response.value = null
  error.value = null
  try {
    const data = await $fetch(path)
    response.value = data
  }
  catch (err: any) {
    error.value = err?.data?.message || err?.message || 'Unknown error'
  }
  finally {
    loading.value = false
  }
}

function testServerLog() {
  fetchRoute('/api/test-log')
}

function testServerError() {
  fetchRoute('/api/test-error')
}

function testServerMasking() {
  fetchRoute('/api/test-masking')
}
</script>
