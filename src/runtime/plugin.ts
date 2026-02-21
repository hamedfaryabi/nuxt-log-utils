import { defineNuxtPlugin } from '#app'
import { useLogger } from './composables/useLogger'

export default defineNuxtPlugin(() => {
  return {
    provide: {
      logger: useLogger(),
    },
  }
})
