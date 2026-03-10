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
export type MaskCustomizer = ((value: string) => string) | false | true

export interface LoggerMeta {
  timestamp?: string
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
  config: Config<dataT>
}

export type LoggerMask
  = | string[] // flat array of keys
    | { [key: string]: MaskCustomizer | LoggerMask } // nested object or dot-path keys

export interface LogLevelConfig<dataT extends Record<string, any>> {
  enabled?: boolean
  minLevel?: LogLevel
  maxLevel?: LogLevel
  allowedLevels?: LogLevel[]
  mask?: LoggerMask
  output?: OutputTarget[]
  apiUrl?: string
  filePath?: string
  fileLogPeriod?: FileLogPeriod
  meta?: Record<string, any>
  includeMeta?: boolean
  criticalMeta?: string[]
  formatter?: (ctx: LoggerFormatterContext<dataT>) => any
  beforeSend?: (payload: LogPayload<dataT>) => LogPayload<dataT> | false | undefined
  afterSend?: (payload: LogPayload<dataT>) => void
}

export interface Config<dataT extends Record<string, any> = Record<string, any>> extends LogLevelConfig<dataT> {
  /**
   * Per-level config overrides.
   * When a log is sent, if the level has a config here,
   * it is merged (with priority) over the global config.
   */
  levels?: Partial<Record<LogLevel | LogLevelKey, LogLevelConfig<dataT>>>
}

export type LoggerConfig<dataT extends Record<string, any> = Record<string, any>> = Record<string, Partial<Config<dataT>>>
