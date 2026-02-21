import {
  defineNuxtModule,
  addPlugin,
  addImportsDir,
  createResolver,
  addServerImportsDir,
} from '@nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: 'pms-logger',
    configKey: 'logger',
  },

  setup() {
    const resolver = createResolver(import.meta.url)

    addPlugin(resolver.resolve('runtime/plugin'))
    addImportsDir(resolver.resolve('runtime/composables'))
    addServerImportsDir(resolver.resolve('runtime/composables'))
  },
})
