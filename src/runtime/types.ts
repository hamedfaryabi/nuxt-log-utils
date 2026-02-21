/* eslint-disable @typescript-eslint/no-explicit-any */
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

export interface LoggerMeta {
  timestamp?: string
  path?: string
  isServer?: boolean
  [key: string]: any
}

export interface LogPayload {
  level: LogLevel | LogLevelKey
  message: string
  data?: Record<string, any>
  meta?: LoggerMeta
}

export interface LoggerFormatterContext {
  payload: LogPayload
  config: LoggerConfig
}

export interface LoggerConfig {
  // TODO - minLevel
  level?: LogLevel
  output?: OutputTarget[]
  apiUrl?: string
  filePath?: string
  meta?: Record<string, any>
  includeMeta?: boolean

  formatter?: (ctx: LoggerFormatterContext) => any
  // eslint-disable-next-line
  beforeSend?: (payload: LogPayload) => LogPayload | false | void
  afterSend?: (payload: LogPayload) => void

  // TODO - MASK
  // TODO - max level
  // TODO - Conditional log based on level
}
