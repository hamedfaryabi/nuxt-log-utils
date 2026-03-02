import {
  defineNuxtModule,
  addPlugin,
  addImportsDir,
  createResolver,
  addServerImportsDir,
  addTemplate,
} from "@nuxt/kit";
import type { LoggerConfig } from "./runtime/types";

export default defineNuxtModule({
  meta: {
    name: "nuxt-log",
    configKey: "logger",
  },

  setup(options: Partial<LoggerConfig>, nuxt) {
    var serialize = require("serialize-javascript");
    const resolver = createResolver(import.meta.url);

    const template = addTemplate({
      filename: "nuxt-log.plugin.mjs",
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
    });

    addPlugin({
      src: template.dst
    })
    addPlugin(resolver.resolve("runtime/plugin"));
    addImportsDir(resolver.resolve("runtime/composables"));
    addServerImportsDir(resolver.resolve("runtime/composables"));
  },
});
