export default defineNuxtConfig({
  modules: ["nuxt-log"],
  devtools: { enabled: true },
  compatibilityDate: "latest",

  logger: {
    minLevel: 100,
    output: ["console"],
    includeMeta: true,

    levels: {
      400: {
        output: ["console", "file"],
        filePath: "logs/errors.log",
        fileLogPeriod: "daily",
      },
      500: {
        output: ["console", "api"],
        apiUrl: "/api/logs",
      },
    },

    loggers: {
      auth: {
        minLevel: 100,
        mask: ["password", "token"],
      },
      payment: {
        output: ["console", "file"],
        filePath: "logs/payment.log",
        fileLogPeriod: "monthly",
        mask: {
          cardNumber: (v: string) => `****${v.slice(-4)}`,
          cvv: false,
        },
      },
    },
  },
});
