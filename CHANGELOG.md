# Changelog

## v0.2.5

[compare changes](https://github.com/hamedfaryabi/nuxt-log-utils/compare/v0.2.4...v0.2.5)

## v0.2.0

### 🚀 Features

- Server-side `useLogger()` auto-import for Nitro event handlers
- JSON config file support (`logger.config.json`)
- Environment variable config (`LOGGER_{NAME}_{KEY}`) with nested key support via `__`
- Critical meta stripping — sensitive metadata keys are removed on the client
- Internal `/__logger` proxy route for secure client-side API transport
- `/__logger-config` server route for client-side config hydration
- `enabled` option to disable individual loggers or levels
- Config merge chain: env → JSON → local overrides → runtime → module options → defaults

### 🔧 Refactors

- Extracted config utilities into `utils/config/` (mergeConfigs, parseEnvConfig, loadJsonConfig, buildClientConfig, stripCriticalMeta)
- Centralized logger instance creation in `loggerCore.ts` (shared by client and server)
- Moved `resolveConfig` to async resolution with env + JSON + runtime layers
- Plugin now pre-resolves all named logger configs on server and hydrates to client
- Removed `path` from default metadata

### 🏠 Housekeeping

- Removed unused `@nuxt/schema` and `@nuxt/test-utils` dev dependencies
- Updated tests for refactored module architecture
- Updated README with accurate config examples, env var format, and new features
- Removed stale comments and dead code

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
