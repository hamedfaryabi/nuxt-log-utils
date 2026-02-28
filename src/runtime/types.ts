/**
 * RFC 5424 / Monolog log levels
 */
export enum LogLevel {
  DEBUG = 100,
  INFO = 200,
  NOTICE = 250,
  WARNING = 300,
  ERROR = 400,
  CRITICAL = 500,
  ALERT = 550,
  EMERGENCY = 600,
}

export type LogLevelKey = keyof typeof LogLevel
export type OutputTarget = 'console' | 'file' | 'api'
export type FileLogPeriod = 'daily' | 'monthly' | 'yearly'
export type MaskCustomizer = ((value: string) => string) | false

export interface LoggerMeta {
  timestamp?: string
  path?: string
  isServer?: boolean
  [key: string]: any
}

export interface LogPayload<dataT extends Record<string, any> = Record<string, any>> {
  level: LogLevel | LogLevelKey
  message: string
  data?: dataT
  meta?: LoggerMeta
}

export interface LoggerFormatterContext<dataT extends Record<string, any>> {
  payload: LogPayload<dataT>
  config: LoggerConfig<dataT>
}

export interface LogLevelConfig<dataT extends Record<string, any>> {
  minLevel?: LogLevel
  maxLevel?: LogLevel
  /**
   * **Notice:** If `allowedLevels` is set, it takes full control
   */
  allowedLevels?: LogLevel[]
  mask?: string[] | Record<string, MaskCustomizer>
  output?: OutputTarget[]
  apiUrl?: string
  filePath?: string
  fileLogPeriod?: FileLogPeriod
  meta?: Record<string, any>
  includeMeta?: boolean
  formatter?: (ctx: LoggerFormatterContext<dataT>) => any
  beforeSend?: (payload: LogPayload<dataT>) => LogPayload<dataT> | false | undefined
  afterSend?: (payload: LogPayload<dataT>) => void
}

export interface LoggerConfig<dataT extends Record<string, any> = Record<string, any>> extends LogLevelConfig<dataT> {
  /**
   * Per-level config overrides.
   * When a log is sent, if the level has a config here,
   * it is merged (with priority) over the global config.
   */
  levels?: Partial<Record<LogLevel | LogLevelKey, LogLevelConfig<dataT>>>
  /**
   * Named logger config overrides.
   * Keys are logger names passed to `useLogger(name)`.
   */
  loggers?: Record<string, Partial<LoggerConfig<dataT>>>
}
