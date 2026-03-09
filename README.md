# nuxt-log

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

A flexible, extensible logger module for Nuxt 3/4 with data masking, file rotation, per-level config, critical-meta stripping, lifecycle hooks, and multiple transport targets.

- [✨ &nbsp;Release Notes](/CHANGELOG.md)
- [🏀 &nbsp;Online Playground](https://stackblitz.com/github/hamedfaryabi/nuxt-log?file=playground%2Fapp.vue)

## Features

- 📊 **RFC 5424 log levels** — DEBUG, INFO, NOTICE, WARNING, ERROR, CRITICAL, ALERT, EMERGENCY
- 🚀 **Three built-in transports** — Console (via [consola](https://github.com/unjs/consola)), file (server-side JSON), and API (HTTP POST)
- 🔒 **Data masking** — Mask or remove sensitive fields with array or object configuration
- 📁 **File log rotation** — Daily, monthly, or yearly log file suffixes
- ⚙️ **Per-level config** — Override output, masking, and hooks for specific log levels
- 🏷️ **Named loggers** — Create scoped loggers with independent configuration
- 🌍 **Environment overrides** — Configure loggers via `LOGGER_*` env vars
- 🪝 **Lifecycle hooks** — `beforeSend`, `afterSend`, and `formatter` for full control
- 🛡️ **Critical meta stripping** — Automatically strip sensitive metadata keys on the client
- 📄 **JSON config file** — Optional `logger.config.json` for file-based configuration
- 🔌 **Auto-imported** — Available as `useLogger()` composable on both client and server
- 💪 **Fully typed** — Written in TypeScript with exported types

## Quick Setup

Install the module:

```bash
npx nuxi module add nuxt-log
```

Or manually:

```bash
npm install nuxt-log
```

Then add it to `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['nuxt-log'],
})
```

That's it! The module auto-registers the `useLogger()` composable and `$logger` plugin — no additional setup required. ✨

## Config Resolution Order

Configs are merged with the following priority (highest first):

```
env vars > JSON file > local overrides > runtime config > module options > defaults
```

## Usage

### Basic Logging

```vue
<script setup>
const logger = useLogger()

logger.info('User signed in', { userId: 123 })
logger.error('Payment failed', { orderId: 'abc', amount: 99.99 })
</script>
```

### Named Loggers

```ts
const authLogger = useLogger('auth')
const paymentLogger = useLogger('payment')

authLogger.info('Login successful')
paymentLogger.error('Charge declined')
```

### Available Methods

| Method | Level Value |
|---|---|
| `logger.debug(message, data?)` | 100 |
| `logger.info(message, data?)` | 200 |
| `logger.notice(message, data?)` | 250 |
| `logger.warning(message, data?)` | 300 |
| `logger.error(message, data?)` | 400 |
| `logger.critical(message, data?)` | 500 |
| `logger.alert(message, data?)` | 550 |
| `logger.emergency(message, data?)` | 600 |

You can also create custom level shortcuts:

```ts
const logger = useLogger()
const logCritical = logger.create(LogLevel.CRITICAL)
logCritical('System overload', { cpu: 99 })
```

## Configuration

Configure the logger in `nuxt.config.ts` under the `logger` module option key:

```ts
export default defineNuxtConfig({
  modules: ['nuxt-log'],
  logger: {
    default: {
      minLevel: 200,        // LogLevel.INFO
      output: ['console'],
      includeMeta: true,

      levels: {
        400: {               // LogLevel.ERROR
          output: ['console', 'file'],
          filePath: 'logs/errors.log',
          fileLogPeriod: 'daily',
        },
        500: {               // LogLevel.CRITICAL
          output: ['console', 'api'],
          apiUrl: '/api/logs',
        },
      },
    },
    auth: {
      minLevel: 100,        // LogLevel.DEBUG
      mask: ['password', 'token'],
    },
    payment: {
      output: ['console', 'file'],
      filePath: 'logs/payment.log',
      fileLogPeriod: 'monthly',
    },
  },
})
```

### Config Options

| Option | Type | Default | Description |
|---|---|---|---|
| `minLevel` | `LogLevel` | `LogLevel.INFO` | Minimum level to log |
| `maxLevel` | `LogLevel` | `undefined` | Maximum level to log |
| `allowedLevels` | `LogLevel[]` | `undefined` | Explicit allowlist (overrides min/max) |
| `output` | `OutputTarget[]` | `['console']` | Transport targets: `'console'`, `'file'`, `'api'` |
| `mask` | `string[] \| Record<string, MaskCustomizer>` | `undefined` | Fields to mask in log data |
| `filePath` | `string` | `undefined` | File path for file transport |
| `fileLogPeriod` | `FileLogPeriod` | `undefined` | Rotation period: `'daily'`, `'monthly'`, `'yearly'` |
| `apiUrl` | `string` | `undefined` | Endpoint URL for API transport |
| `includeMeta` | `boolean` | `true` | Include auto-generated metadata |
| `meta` | `Record<string, any>` | `undefined` | Additional metadata merged into every log |
| `criticalMeta` | `string[]` | `undefined` | Meta keys stripped on client (dot-notation supported) |
| `enabled` | `boolean` | `undefined` | Set to `false` to disable this logger |
| `formatter` | `(ctx) => any` | `undefined` | Custom payload formatter |
| `beforeSend` | `(payload) => payload \| false` | `undefined` | Hook before sending — return `false` to cancel |
| `afterSend` | `(payload) => void` | `undefined` | Hook after successful send |
| `levels` | `Record<LogLevel, LogLevelConfig>` | `undefined` | Per-level config overrides |

## Data Masking

### Array Mode — Default Mask

Provide an array of field names. Matched fields are masked with the pattern `xx****xx`:

```ts
{
  mask: ['mobile', 'email', 'ssn']
}
```

```ts
logger.info('User data', { mobile: '09123456789', name: 'Alice' })
// → { mobile: '09****89', name: 'Alice' }
```

### Object Mode — Custom Maskers

Provide an object to use custom mask functions or remove fields entirely:

```ts
{
  mask: {
    // Custom function
    mobile: (value) => value.slice(0, 4) + '****',
    // Remove the field entirely
    access_token: false,
  }
}
```

```ts
logger.info('Auth', { mobile: '09123456789', access_token: 'secret123' })
// → { mobile: '0912****' }   (access_token removed)
```

Masking is applied recursively to nested objects and arrays.

## File Transport & Rotation

The file transport writes JSON lines to disk (server-side only):

```ts
{
  output: ['file'],
  filePath: 'logs/app.log',
  fileLogPeriod: 'daily',
}
```

Rotation suffixes are inserted before the file extension:

| Period | Example Output |
|---|---|
| `daily` | `logs/app-2026-02-19.log` |
| `monthly` | `logs/app-2026-02.log` |
| `yearly` | `logs/app-2026.log` |
| `undefined` | `logs/app.log` |

## API Transport

Send logs to a remote endpoint via HTTP POST:

```ts
{
  output: ['api'],
  apiUrl: '/api/logs',
}
```

The payload is sent as JSON in the request body using `$fetch`.

## Environment Variable Overrides

Override config for named loggers at runtime using environment variables:

```
LOGGER_{NAME}_{KEY}=value
```

Examples:

```bash
LOGGER_DEFAULT_MIN_LEVEL=100
LOGGER_AUTH_OUTPUT=console,file
LOGGER_PAYMENT_FILE_PATH=logs/payment.log
LOGGER_DEFAULT_MASK=email,ip
LOGGER_DEFAULT_LEVELS__ERROR__MIN_LEVEL=400
```

Env overrides take the highest priority in the config merge chain:

```
env vars > JSON file > local overrides > runtime config > module options > defaults
```

## Lifecycle Hooks

### `beforeSend`

Intercept and modify the payload before it is sent to transports. Return `false` to cancel the log:

```ts
{
  beforeSend: (payload) => {
    if (payload.message.includes('health-check')) return false
    return { ...payload, message: `[MyApp] ${payload.message}` }
  }
}
```

### `afterSend`

Run side effects after a log is successfully sent:

```ts
{
  afterSend: (payload) => {
    // e.g. increment a metrics counter
  }
}
```

### `formatter`

Transform the final payload shape before dispatch:

```ts
{
  formatter: ({ payload, config }) => {
    return {
      ...payload,
      message: payload.message.toUpperCase(),
    }
  }
}
```

## JSON Config File

You can also configure loggers via a `logger.config.json` file in the project root (server-side only):

```json
{
  "default": {
    "minLevel": 100,
    "criticalMeta": ["user.token"],
    "meta": {
      "user": {
        "token": "secret-token"
      }
    }
  }
}
```

## Metadata

Each log automatically includes metadata:

```json
{
  "timestamp": "2026-03-09T12:00:00.000Z",
  "isServer": false
}
```

- `timestamp` — ISO 8601 timestamp
- `isServer` — Whether the log was created on the server

Disable auto-metadata with `includeMeta: false`, or merge additional fields with the `meta` option.

## TypeScript

All types are exported from the package:

```ts
import type {
  LogLevel,
  LogLevelKey,
  LoggerConfig,
  LogPayload,
  LoggerMeta,
  OutputTarget,
  FileLogPeriod,
  MaskCustomizer,
  LogLevelConfig,
  LoggerFormatterContext,
} from 'nuxt-log'
```

## Server-Side Usage

On the server (Nitro), `useLogger` is auto-imported and works identically:

```ts
export default defineEventHandler(async () => {
  const logger = useLogger('default')
  await logger.info('Server request handled')
})
```

## Compatibility

| nuxt-log | Nuxt |
|---|---|
| `>=0.1.0` | `^3.0.0 \|\| ^4.0.0` |

> **Note:** File transport is server-side only. Console and API transports work on both client and server.
> **Note:** On the client, `apiUrl` is automatically rewritten to the internal `/__logger` proxy route for security.

## Development

```bash
# Install dependencies
pnpm install

# Generate type stubs
pnpm run dev:prepare

# Develop with the playground
pnpm run dev

# Build the playground
pnpm run dev:build

# Run ESLint
pnpm run lint

# Run Vitest
pnpm run test
pnpm run test:watch

# Release new version
pnpm run release
```

## License

[MIT](./LICENSE)

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/nuxt-log/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/nuxt-log

[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-log.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/nuxt-log

[license-src]: https://img.shields.io/npm/l/nuxt-log.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/nuxt-log

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt
[nuxt-href]: https://nuxt.com
