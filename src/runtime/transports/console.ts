import { consola, LogLevels } from "consola";
import { LogLevel, type LoggerConfig, type LogPayload } from "../types";

const levelMap: Record<LogLevel, number> = {
  [LogLevel.DEBUG]: 4,
  [LogLevel.INFO]: 3,
  [LogLevel.NOTICE]: 3,
  [LogLevel.WARNING]: 1,
  [LogLevel.ERROR]: 0,
  [LogLevel.CRITICAL]: 0,
  [LogLevel.ALERT]: 1,
  [LogLevel.EMERGENCY]: 0,
};

export async function consoleTransport(
  payload: LogPayload,
  _config: LoggerConfig,
): Promise<void> {
  const numericLevel =
    typeof payload.level === "number" ? payload.level : LogLevel.INFO;
  const consolaLevel = levelMap[numericLevel as LogLevel] ?? 3;

  try {
    consola.log({
      level: consolaLevel,
      message: payload.message,
      data: payload.data,
      meta: payload.meta,
    });
  } catch (error) {
    console.error("[nuxt-log] Console transport error:", error);
  }
}
