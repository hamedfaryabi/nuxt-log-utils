import {
  defineNuxtModule,
  addPlugin,
  addImportsDir,
  createResolver,
  addServerImportsDir,
  addTemplate,
  addServerHandler,
} from '@nuxt/kit'
import type { LoggerConfig } from './runtime/types'
import serialize from 'serialize-javascript'

export default defineNuxtModule({
  meta: {
    name: 'nuxt-log',
    configKey: 'logger',
  },

  setup(options: Partial<LoggerConfig>, _nuxt) {
    const resolver = createResolver(import.meta.url)

    const template = addTemplate({
      filename: 'nuxt-log.plugin.mjs',
      getContents: () => `
        import { defineNuxtPlugin } from '#app'
        const loggerConfig = ${serialize(options, {
          unsafe: true,
        })}

        export default defineNuxtPlugin(() => {
          return {
            provide: {
              loggerConfig
            }
          }
        })
      `,
    })

    addPlugin({
      src: template.dst,
    })
    addPlugin(resolver.resolve('runtime/plugin'))
    addImportsDir(resolver.resolve('runtime/composables'))
    addServerImportsDir(resolver.resolve('runtime/composables'))
    addServerHandler({
      route: '/__logger/[name]',
      handler: resolver.resolve('runtime/server/routes/__logger/[name].post.ts'),
    })

    addServerHandler({
      route: '/__logger-config',
      handler: resolver.resolve('runtime/server/routes/__logger-config.get'),
    })
  },
})
