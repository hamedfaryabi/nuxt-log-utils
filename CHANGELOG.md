# Changelog

## v0.1.0

🚀 Initial release

- RFC 5424 log levels (DEBUG through EMERGENCY)
- Three built-in transports: console, file, and API
- Data masking with array and object modes (recursive)
- File log rotation: daily, monthly, yearly
- Per-level configuration overrides
- Named loggers with independent config
- Environment variable overrides (`NUXT_PUBLIC_LOGGER_*`)
- Lifecycle hooks: `beforeSend`, `afterSend`, `formatter`
- Auto-imported `useLogger()` composable and `$logger` plugin
- Full TypeScript support with exported types
- Nuxt 3 and Nuxt 4 compatibility
